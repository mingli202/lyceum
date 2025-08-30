import { internalQuery, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";
import {
  CanView,
  ClassInfo,
  ClassPageData,
  ClubPreviewInfo,
  DashboardData,
  UserPostPreviewInfo,
  ProfileData,
  User,
  UserCardInfo,
  UserTask,
  ClubPostPreviewInfo,
  UserOrClubPost,
} from "./types";
import schema from "./schema";
import { authorize, getUserFromClerkId } from "./utils";
import { Id } from "./_generated/dataModel";

export const _getUserFromClerkId = internalQuery({
  args: { signature: v.optional(v.string()) },
  returns: v.union(
    v.object({
      ...schema.tables.users.validator.fields,
      _id: v.id("users"),
      _creationTime: v.float64(),
    }),
    v.null(),
  ),
  handler: async (ctx, args): Promise<User | null> => {
    const clerkId = await authorize(ctx, args.signature);

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();

    return user;
  },
});

export const _getUserClassAverageGrade = internalQuery({
  args: { classId: v.id("classes"), userId: v.id("users") },
  returns: { remainingGrade: v.number(), currentGrade: v.number() },
  handler: async (
    ctx,
    args,
  ): Promise<{ remainingGrade: number; currentGrade: number }> => {
    const tasks = await ctx.db
      .query("userTasks")
      .withIndex("by_userId_classId", (q) =>
        q.eq("userId", args.userId).eq("classId", args.classId),
      )
      .collect();

    let totalWeightCompleted = 0;
    let currentGrade = 0;
    let totalWeight = 0;

    for (const task of tasks) {
      if (task.status === "dropped") {
        continue;
      }

      totalWeight += task.weight;
      if (task.status === "completed") {
        totalWeightCompleted += task.weight;
        currentGrade += (task.weight * task.scoreObtained) / task.scoreTotal;
      }
    }

    const userClassInfo = await ctx.db
      .query("userClassInfo")
      .withIndex("by_userId_classId", (q) =>
        q.eq("userId", args.userId).eq("classId", args.classId),
      )
      .unique();

    const grade =
      totalWeightCompleted === 0 ? 0 : currentGrade / totalWeightCompleted;

    return {
      currentGrade: 100 * grade,
      remainingGrade:
        totalWeight - totalWeightCompleted === 0
          ? 0
          : (100 *
              ((totalWeight * (userClassInfo?.targetGrade ?? 85)) / 100 -
                currentGrade)) /
            (totalWeight - totalWeightCompleted),
    };
  },
});

export const getCanViewUserInfo = query({
  args: {
    requestedUserId: v.optional(v.id("users")),
  },
  returns: CanView,
  handler: async (ctx, args): Promise<CanView> => {
    const { requestedUserId } = args;

    const authenticatedUser = await getUserFromClerkId(ctx, args);

    if (!authenticatedUser) {
      return { canView: false, reason: "User not found" } as const;
    }

    const authenticatedUserId = authenticatedUser._id;

    if (requestedUserId && requestedUserId !== authenticatedUserId) {
      const requestedUserFollowingInfo = await ctx.db
        .query("followingsInfo")
        .withIndex("by_userId_followingId", (q) =>
          q
            .eq("userId", authenticatedUserId)
            .eq("followingId", requestedUserId),
        )
        .unique()
        .catch(() => null);

      if (
        !requestedUserFollowingInfo ||
        requestedUserFollowingInfo.status === "unfollowed"
      ) {
        const requestedUserProfile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", requestedUserId))
          .unique()
          .catch(() => null);

        if (!requestedUserProfile) {
          return { canView: false, reason: "User not found" } as const;
        }

        if (requestedUserProfile.isPrivate) {
          return { canView: false, reason: "Private account" } as const;
        }

        return { canView: true, reason: "Public account" } as const;
      }

      switch (requestedUserFollowingInfo.status) {
        case "requested":
          return { canView: false, reason: "Requested" } as const;
        case "accepted":
          return { canView: true, reason: "Following" } as const;
        case "blocked":
          return { canView: false, reason: "Blocked" } as const;
      }
    }

    return { canView: true, reason: "Own account" } as const;
  },
});

export const getUser = query({
  args: v.object({ signature: v.optional(v.string()) }),
  returns: v.union(
    v.object({
      ...schema.tables.users.validator.fields,
      _id: v.id("users"),
      _creationTime: v.float64(),
    }),
    v.literal("N/A"),
  ),
  handler: async (ctx, args): Promise<User | "N/A"> => {
    const user = await ctx.runQuery(internal.queries._getUserFromClerkId, args);

    return user ?? "N/A";
  },
});

export const getDashboardData = query({
  returns: DashboardData,
  handler: async (ctx): Promise<DashboardData> => {
    const classes: ClassInfo[] = await ctx.runQuery(
      api.queries.getUserClasses,
      { canView: true },
    );

    return {
      classesInfo: classes,
      average:
        classes.length === 0
          ? undefined
          : classes.reduce((acc, classInfo) => {
              return acc + classInfo.grade;
            }, 0) / classes.length,
    };
  },
});

export const getProfileData = query({
  args: { requestedUserId: v.optional(v.id("users")) },
  returns: v.union(ProfileData, v.string()),
  handler: async (ctx, args): Promise<ProfileData | string> => {
    const { requestedUserId } = args;
    const authenticatedUser = await getUserFromClerkId(ctx, args);

    if (!authenticatedUser) {
      return "Unauthenticated";
    }

    const user = await ctx.db.get(requestedUserId ?? authenticatedUser?._id);

    if (!user) {
      return "User not found";
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique()
      .catch(() => null);

    if (!profile) {
      return "User profile not found";
    }

    const bannerUrl = profile.bannerId
      ? ((await ctx.storage.getUrl(profile.bannerId)) ?? undefined)
      : undefined;

    const profileData: ProfileData = {
      userId: user._id,
      school: profile.school,
      major: profile.major,
      firstName: user.givenName,
      lastName: user.familyName,
      username: user.username,
      academicYear: profile.academicYear,
      city: profile.city,
      email: user.email,
      pictureUrl: user.pictureUrl,
      bio: profile.bio,
      clerkId: user.clerkId,
      isPrivate: profile.isPrivate,
      bannerUrl,
    };

    return profileData;
  },
});

export const getFollowerCount = query({
  args: { userId: v.id("users") },
  returns: v.number(),
  handler: async (ctx, args): Promise<number> => {
    const { userId } = args;

    const nFollowers = await ctx.db
      .query("followingsInfo")
      .withIndex("by_followingId", (q) => q.eq("followingId", userId))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();

    return nFollowers.length;
  },
});

export const getFollowingCount = query({
  args: { userId: v.id("users") },
  returns: v.number(),
  handler: async (ctx, args): Promise<number> => {
    const { userId } = args;

    const nFollowing = await ctx.db
      .query("followingsInfo")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();

    return nFollowing.length;
  },
});

export const getUserPosts = query({
  args: { requestedUserId: v.optional(v.id("users")), canView: v.boolean() },
  returns: v.array(UserPostPreviewInfo),
  handler: async (ctx, args): Promise<UserPostPreviewInfo[]> => {
    const { requestedUserId, canView } = args;

    if (!canView) {
      return [];
    }

    const authenticatedUser = await getUserFromClerkId(ctx, args);

    if (!authenticatedUser) {
      return [];
    }

    const userId = requestedUserId ?? authenticatedUser._id;

    const toReturn: UserPostPreviewInfo[] = [];
    for await (const userPost of ctx.db
      .query("userPosts")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")) {
      const author = await ctx.db.get(userId);

      if (!author) {
        continue;
      }

      const post = await ctx.db.get(userPost.postId);

      if (!post) {
        continue;
      }

      let imageUrl;

      if (post.imageId) {
        imageUrl = (await ctx.storage.getUrl(post.imageId)) ?? undefined;
      }

      const postPreviewInfo: UserPostPreviewInfo = {
        postId: userPost.postId,
        isOwner: authenticatedUser._id === author._id,
        author: {
          authorId: userId,
          pictureUrl: author.pictureUrl,
          firstName: author.givenName,
          lastName: author.familyName,
          username: author.username,
        },
        nComments: (
          await ctx.db
            .query("comments")
            .withIndex("by_postId", (q) => q.eq("postId", post._id))
            .collect()
        ).length,
        nReplies: (
          await ctx.db
            .query("replies")
            .withIndex("by_postId", (q) => q.eq("postId", post._id))
            .collect()
        ).length,
        nLikes: post.likes.length,
        createdAt: post._creationTime,
        description: post.description,
        imageUrl,
      };
      toReturn.push(postPreviewInfo);
    }

    return toReturn;
  },
});

export const getUserClasses = query({
  args: { requestedUserId: v.optional(v.id("users")), canView: v.boolean() },
  returns: v.array(ClassInfo),
  handler: async (ctx, args): Promise<ClassInfo[]> => {
    const { canView, requestedUserId } = args;

    if (!canView) {
      return [];
    }

    const authenticatedUser = await getUserFromClerkId(ctx, args);

    if (!authenticatedUser) {
      return [];
    }

    const userId = requestedUserId ?? authenticatedUser._id;

    const toReturn: ClassInfo[] = [];

    for await (const userClassInfo of ctx.db
      .query("userClassInfo")
      .withIndex("by_userId", (q) => q.eq("userId", userId))) {
      const classId = userClassInfo.classId;
      const classInfo = await ctx.db.get(classId);

      if (!classInfo) {
        continue;
      }

      toReturn.push({
        code: classInfo.code,
        title: classInfo.title,
        professor: classInfo.professor,
        classId: classInfo._id,
        grade: (
          await ctx.runQuery(internal.queries._getUserClassAverageGrade, {
            classId: classInfo._id,
            userId,
          })
        ).currentGrade,
      });
    }

    return toReturn;
  },
});

export const getUserClubs = query({
  args: { requestedUserId: v.optional(v.id("users")), canView: v.boolean() },
  returns: v.array(ClubPreviewInfo),
  handler: async (ctx, args): Promise<ClubPreviewInfo[]> => {
    const { canView, requestedUserId } = args;

    if (!canView) {
      return [];
    }

    const authenticatedUser = await getUserFromClerkId(ctx, args);

    if (!authenticatedUser) {
      return [];
    }

    const userId = requestedUserId ?? authenticatedUser._id;

    const clubsPreviewInfo: ClubPreviewInfo[] = [];

    for await (const userClubInfo of ctx.db
      .query("userClubsInfo")
      .withIndex("by_userId", (q) => q.eq("userId", userId))) {
      const club = await ctx.db.get(userClubInfo.clubId);

      if (!club) {
        continue;
      }

      const members = await ctx.db
        .query("userClubsInfo")
        .withIndex("by_clubId")
        .collect();

      const clubPreviewInfo: ClubPreviewInfo = {
        category: club.category,
        clubId: club._id,
        description: club.description,
        pictureUrl: club.pictureUrl,
        name: club.name,
        isPrivate: club.isPrivate,
        nMembers: members.length,
        status: userClubInfo.status,
      };

      clubsPreviewInfo.push(clubPreviewInfo);
    }

    return clubsPreviewInfo;
  },
});

export const getClassPageData = query({
  args: { classId: v.optional(v.string()) },
  returns: v.union(ClassPageData, v.string()),
  handler: async (ctx, args): Promise<ClassPageData | string> => {
    const user = await getUserFromClerkId(ctx, args);
    const classInfo = await ctx.db
      .get(args.classId as Id<"classes">)
      .catch(() => null);

    if (!classInfo) {
      return "Class not found";
    }

    if (!user) {
      return "User not found";
    }

    const userClassInfo = await ctx.db
      .query("userClassInfo")
      .withIndex("by_userId_classId", (q) =>
        q.eq("userId", user._id).eq("classId", classInfo._id),
      )
      .unique();

    if (!userClassInfo) {
      return "Not registered";
    }

    const grade = await ctx.runQuery(
      internal.queries._getUserClassAverageGrade,
      { userId: user._id, classId: classInfo._id },
    );

    const nClassmates = await ctx.db
      .query("userClassInfo")
      .withIndex("by_classId", (q) => q.eq("classId", classInfo._id))
      .collect();

    const classPageData: ClassPageData = {
      classId: classInfo._id,
      title: classInfo.title,
      professor: classInfo.professor,
      code: classInfo.code,
      credits: classInfo.credits,
      grade: grade.currentGrade,
      remainingGrade: grade.remainingGrade,
      nClassmates: nClassmates.length,
      school: classInfo.school,
      semester: classInfo.semester,
      year: classInfo.year,
      targetGrade: userClassInfo.targetGrade,
      classTimes: classInfo.classTimes,
    };

    return classPageData;
  },
});

export const getUserClassTasks = query({
  args: { classId: v.id("classes"), signature: v.optional(v.string()) },
  returns: v.array(
    v.object({
      ...schema.tables.userTasks.validator.fields,
      _id: v.id("userTasks"),
      _creationTime: v.float64(),
    }),
  ),
  handler: async (ctx, args): Promise<UserTask[]> => {
    const user = await getUserFromClerkId(ctx, args);

    if (!user) {
      return [];
    }

    const userTasks = await ctx.db
      .query("userTasks")
      .withIndex("by_userId_classId", (q) =>
        q.eq("userId", user._id).eq("classId", args.classId),
      )
      .collect();

    return userTasks.sort(
      (a, b) => Date.parse(a.dueDate) - Date.parse(b.dueDate),
    );
  },
});

export const getClassStudents = query({
  args: { classId: v.id("classes"), signature: v.optional(v.string()) },
  returns: v.array(UserCardInfo),
  handler: async (ctx, args): Promise<UserCardInfo[]> => {
    const userCardsInfo: UserCardInfo[] = [];

    for await (const student of ctx.db
      .query("userClassInfo")
      .withIndex("by_classId", (q) => q.eq("classId", args.classId))) {
      const user = await ctx.db.get(student.userId);

      if (!user) {
        continue;
      }

      const userCardInfo: UserCardInfo = {
        userId: student.userId,
        pictureUrl: user.pictureUrl,
        firstName: user.givenName,
        username: user.username,
      };

      userCardsInfo.push(userCardInfo);
    }

    return userCardsInfo;
  },
});

export const getUserLastSeenAt = query({
  args: { userId: v.id("users") },
  returns: v.number(),
  handler: async (ctx, args): Promise<number> => {
    await authorize(ctx);

    const { userId } = args;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique()
      .catch(() => null);

    if (!profile) {
      return 0;
    }

    return profile.lastSeenAt ?? 0;
  },
});

export const getFeedData = query({
  returns: v.array(UserOrClubPost),
  handler: async (ctx, args): Promise<UserOrClubPost[]> => {
    const authenticatedUser = await getUserFromClerkId(ctx, args);

    if (!authenticatedUser) {
      return [];
    }

    const postsInfo: UserOrClubPost[] = [];

    for await (const viewablePost of ctx.db
      .query("viewablePosts")
      .withIndex("by_userId", (q) => q.eq("userId", authenticatedUser._id))
      .order("desc")) {
      const post = await ctx.db.get(viewablePost.postId);

      if (!post) {
        continue;
      }

      const userPost = await ctx.db
        .query("userPosts")
        .withIndex("by_postId", (q) => q.eq("postId", post._id))
        .unique();

      if (userPost) {
        const author = await ctx.db.get(userPost.userId);
        if (!author) {
          continue;
        }
        const followingInfo = await ctx.db
          .query("followingsInfo")
          .withIndex("by_userId_followingId", (q) =>
            q.eq("userId", authenticatedUser._id).eq("followingId", author._id),
          )
          .unique()
          .catch(() => null);

        if (!followingInfo || followingInfo.status !== "accepted") {
          continue;
        }

        let imageUrl;

        if (post.imageId) {
          imageUrl = (await ctx.storage.getUrl(post.imageId)) ?? undefined;
        }

        const userPostPreviewInfo: UserPostPreviewInfo = {
          postId: post._id,
          isOwner: authenticatedUser._id === author._id,
          author: {
            authorId: author._id,
            pictureUrl: author.pictureUrl,
            firstName: author.givenName,
            lastName: author.familyName,
            username: author.username,
          },
          nComments: (
            await ctx.db
              .query("comments")
              .withIndex("by_postId", (q) => q.eq("postId", post._id))
              .collect()
          ).length,
          nReplies: (
            await ctx.db
              .query("replies")
              .withIndex("by_postId", (q) => q.eq("postId", post._id))
              .collect()
          ).length,
          nLikes: post.likes.length,
          createdAt: post._creationTime,
          description: post.description,
          imageUrl,
        };
        postsInfo.push({ type: "user", post: userPostPreviewInfo } as const);
      } else {
        const clubPost = await ctx.db
          .query("clubPosts")
          .withIndex("by_postId", (q) => q.eq("postId", post._id))
          .unique();

        if (!clubPost) {
          continue;
        }

        const club = await ctx.db.get(clubPost.clubId);

        if (!club) {
          continue;
        }

        let imageUrl;

        if (post.imageId) {
          imageUrl = (await ctx.storage.getUrl(post.imageId)) ?? undefined;
        }

        const clubPostPreviewInfo: ClubPostPreviewInfo = {
          postId: post._id,
          club: {
            clubId: club._id,
            pictureUrl: club.pictureUrl,
            name: club.name,
          },
          nComments: (
            await ctx.db
              .query("comments")
              .withIndex("by_postId", (q) => q.eq("postId", post._id))
              .collect()
          ).length,
          nReplies: (
            await ctx.db
              .query("replies")
              .withIndex("by_postId", (q) => q.eq("postId", post._id))
              .collect()
          ).length,
          nLikes: post.likes.length,
          createdAt: post._creationTime,
          description: post.description,
          imageUrl,
          isMembersOnly: clubPost.isMembersOnly,
        };

        postsInfo.push({ type: "club", post: clubPostPreviewInfo } as const);
      }
    }

    return postsInfo;
  },
});
