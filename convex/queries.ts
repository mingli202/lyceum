import { internalQuery, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";
import {
  ClassInfo,
  ClubPreviewInfo,
  ClubUserStatus,
  DashboardData,
  PostPreviewInfo,
  ProfileData,
  User,
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
  returns: v.number(),
  handler: async (ctx, args): Promise<number> => {
    const tasks = await ctx.db
      .query("userTasks")
      .withIndex("by_userId_classId", (q) =>
        q.eq("userId", args.userId).eq("classId", args.classId),
      )
      .collect();

    let totalWeight = 0;

    const grade = tasks.reduce((acc, task) => {
      totalWeight += task.weight;
      return acc + task.scoreTotal === 0
        ? 0
        : (task.weight * task.scoreObtained) / task.scoreTotal;
    }, 0);

    return grade / totalWeight;
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
  args: { signature: v.optional(v.string()) },
  returns: DashboardData,
  handler: async (ctx, args): Promise<DashboardData> => {
    const classes: ClassInfo[] = await ctx.runQuery(
      api.queries.getUserClasses,
      { signature: args.signature },
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
  args: { signature: v.optional(v.string()) },
  returns: ProfileData,
  handler: async (ctx, args): Promise<ProfileData> => {
    const user = await getUserFromClerkId(ctx, args);

    if (!user) {
      throw new Error("User not found");
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (!profile) {
      throw new Error("User profile not found");
    }

    const profileData: ProfileData = {
      school: profile.school,
      major: profile.major,
      firstName: user.givenName,
      lastName: user.familyName,
      username: profile.username,
      academicYear: profile.academicYear,
      city: profile.city,
      email: user.email,
      pictureUrl: user.pictureUrl,
      bio: profile.bio,
      followers: profile.followers,
      following: profile.following,
    };

    return profileData;
  },
});

export const getUserPosts = query({
  args: { signature: v.optional(v.string()) },
  returns: v.array(PostPreviewInfo),
  handler: async (ctx, args): Promise<PostPreviewInfo[]> => {
    const user = await getUserFromClerkId(ctx, args);

    if (!user) {
      return [];
    }

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_authorId", (q) => q.eq("authorId", user._id))
      .collect();

    const postsInfo = await Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        const authorProfile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", post.authorId))
          .unique();

        if (!author || !authorProfile) {
          return null;
        }

        const clubInfo = post.club
          ? {
              clubName: (await ctx.db.get(post.club.id))?.name ?? "N/A",
              private: post.club.private,
            }
          : null;

        const postPreviewInfo: PostPreviewInfo = {
          postId: post._id,
          author: {
            authorId: post.authorId,
            pictureUrl: author.pictureUrl,
            firstName: author.givenName,
            lastName: author.familyName,
            username: authorProfile.username,
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
          clubInfo,
          description: post.description,
          imageUrl: post.imageUrl,
        };

        return postPreviewInfo;
      }),
    );

    return postsInfo.filter((postInfo) => postInfo !== null);
  },
});

export const getUserClasses = query({
  args: { signature: v.optional(v.string()) },
  returns: v.array(ClassInfo),
  handler: async (ctx, args): Promise<ClassInfo[]> => {
    const user = await getUserFromClerkId(ctx, args);

    if (!user) {
      return [];
    }

    const userClassesInfo = await ctx.db
      .query("userClassInfo")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    return (
      await Promise.all(
        userClassesInfo.map(async (userClassInfo) => {
          const classId = userClassInfo.classId;
          const classInfo = await ctx.db.get(classId);

          if (!classInfo) {
            return null;
          }

          return {
            code: classInfo.code,
            title: classInfo.title,
            professor: classInfo.professor,
            classId: classInfo._id,
            grade: await ctx.runQuery(
              internal.queries._getUserClassAverageGrade,
              { classId: classInfo._id, userId: user._id },
            ),
          };
        }),
      )
    ).filter((classInfo) => classInfo !== null);
  },
});

export const getUserClubs = query({
  args: { signature: v.optional(v.string()) },
  returns: v.array(ClubPreviewInfo),
  handler: async (ctx, args): Promise<ClubPreviewInfo[]> => {
    const user = await getUserFromClerkId(ctx, args);

    if (!user) {
      return [];
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (!profile) {
      return [];
    }

    const clubsPreviewInfo: ClubPreviewInfo[] = (
      await Promise.all(
        profile.clubs.map(async (clubId) => {
          const club = await ctx.db.get(clubId);
          if (!club) {
            return null;
          }

          let status: ClubUserStatus;

          if (club.adminId === user._id) {
            status = "admin";
          } else if (club.members.includes(user._id)) {
            status = "member";
          } else {
            status = "following";
          }

          const clubPreviewInfo: ClubPreviewInfo = {
            category: club.category,
            clubId: club._id,
            description: club.description,
            imageUrl: club.imageUrl,
            name: club.name,
            isPrivate: club.isPrivate,
            nMembers: club.members.length,
            status,
          };

          return clubPreviewInfo;
        }),
      )
    ).filter((club) => club !== null);

    return clubsPreviewInfo;
  },
});
