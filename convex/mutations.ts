import { v } from "convex/values";
import { internalMutation, mutation } from "./_generated/server";
import { authorize, getUserFromClerkId } from "./utils";
import { internal } from "./_generated/api";
import { AddClassArgs, CreateNewUserArgs } from "./types";
import { Id } from "./_generated/dataModel";
import schema from "./schema";

export const _createNewClass = internalMutation({
  returns: v.id("classes"),
  args: v.object({
    ...AddClassArgs.fields,
    userId: v.id("users"),
    school: v.string(),
  }),
  handler: async (ctx, args): Promise<Id<"classes">> => {
    const chatId = await ctx.db.insert("chats", {
      title: `${args.title}'s Chat`,
      members: [args.userId],
    });

    const classId = await ctx.db.insert("classes", {
      code: args.code,
      chat: chatId,

      title: args.title,
      professor: args.professor,
      school: args.school,
      semester: args.semester,
      year: args.year,
      credits: args.credits,
      classTimes: args.classTimes,
    });

    return classId;
  },
});

export const createNewUser = mutation({
  args: CreateNewUserArgs,
  returns: v.literal("ok"),
  handler: async (ctx, args) => {
    const clerkId = await authorize(ctx, args.signature);

    if (
      await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
        .unique()
        .catch(() => true)
    ) {
      throw new Error("User already exists or error");
    }

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      givenName: args.firstName,
      familyName: args.lastName,
      pictureUrl: args.pictureUrl,
      email: args.email,
      username: args.username.replace(/\s/g, "_"),
      state: "active",
    });

    await ctx.db.insert("profiles", {
      userId,
      major: args.major,
      school: args.school,
      bio: args.bio,
      city: args.city,
      academicYear: args.academicYear,
      isPrivate: false,
      isOnline: true,
    });

    return "ok" as const;
  },
});

export const addClass = mutation({
  args: AddClassArgs,
  handler: async (ctx, args) => {
    const user = await getUserFromClerkId(ctx, args);

    if (!user) {
      throw new Error("User not found");
    }

    let school;
    if (args.school) {
      school = args.school;
    } else {
      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .unique();

      if (!profile) {
        throw new Error("User profile not found");
      }
      school = profile.school;
    }

    // search if the class already exists
    const existingClass = await ctx.db
      .query("classes")
      .withIndex("by_school_code", (q) =>
        q.eq("school", school).eq("code", args.code),
      )
      .unique();

    let classId: Id<"classes">;

    if (existingClass) {
      // check if the user is already a student
      const userClassInfo = await ctx.db
        .query("userClassInfo")
        .withIndex("by_userId_classId", (q) =>
          q.eq("userId", user._id).eq("classId", existingClass._id),
        )
        .unique();

      if (userClassInfo) {
        return "Already a student" as const;
      }

      classId = existingClass._id;
    } else {
      classId = await ctx.runMutation(internal.mutations._createNewClass, {
        ...args,
        userId: user._id,
        school: school,
      });
    }

    const classInfoId = await ctx.db.insert("userClassInfo", {
      userId: user._id,
      classId,
      targetGrade: args.targetGrade,
    });

    for (const task of args.tasks) {
      await ctx.db.insert("userTasks", {
        classId,
        userId: user._id,
        description: task.desc,
        dueDate: task.dueDate,
        name: task.name,
        status: "new",
        scoreObtained: 0,
        scoreTotal: 100,
        weight: task.weight,
        userClassInfo: classInfoId,
        type: task.taskType,
      });
    }

    return "ok" as const;
  },
});

export const updateTask = mutation({
  args: {
    taskId: v.id("userTasks"),
    signature: v.optional(v.string()),

    description: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    name: v.optional(v.string()),
    status: v.optional(schema.tables.userTasks.validator.fields.status),
    scoreObtained: v.optional(v.number()),
    scoreTotal: v.optional(v.number()),
    weight: v.optional(v.number()),
    type: v.optional(schema.tables.userTasks.validator.fields.type),
  },
  handler: async (ctx, args) => {
    const user = await getUserFromClerkId(ctx, args);
    const task = await ctx.db.get(args.taskId);

    if (!user) {
      throw new Error("User not found");
    }

    if (!task) {
      throw new Error("Task not found");
    }

    if (task.userId !== user._id) {
      throw new Error("Modifying task of another user");
    }

    const { taskId: _t, signature: _s, ...updatedTask } = args;

    await ctx.db.patch(args.taskId, updatedTask);
  },
});

export const createTask = mutation({
  args: {
    classId: v.id("classes"),
    description: v.string(),
    dueDate: v.string(),
    name: v.string(),
    scoreObtained: v.number(),
    scoreTotal: v.number(),
    weight: v.number(),
    type: schema.tables.userTasks.validator.fields.type,
  },
  handler: async (ctx, args) => {
    const user = await getUserFromClerkId(ctx, args);

    if (!user) {
      throw new Error("User not found");
    }

    const userClassInfo = await ctx.db
      .query("userClassInfo")
      .withIndex("by_userId_classId", (q) =>
        q.eq("userId", user._id).eq("classId", args.classId),
      )
      .unique();

    if (!userClassInfo) {
      throw new Error("Class not found");
    }

    await ctx.db.insert("userTasks", {
      classId: args.classId,
      userId: user._id,
      description: args.description,
      dueDate: args.dueDate,
      name: args.name,
      status: "new",
      scoreObtained: 0,
      scoreTotal: 100,
      weight: args.weight,
      userClassInfo: userClassInfo._id,
      type: args.type,
    });
  },
});

export const deleteTask = mutation({
  args: { taskId: v.id("userTasks") },
  handler: async (ctx, args) => {
    const user = await getUserFromClerkId(ctx, args);

    if (!user) {
      throw new Error("User not found");
    }

    const task = await ctx.db.get(args.taskId);

    if (!task) {
      throw new Error("Task not found");
    }

    if (task.userId !== user._id) {
      throw new Error("Modifying task of another user");
    }

    await ctx.db.delete(args.taskId);
  },
});

export const deleteClass = mutation({
  args: { classId: v.id("classes") },
  handler: async (ctx, args) => {
    const { classId } = args;
    const user = await getUserFromClerkId(ctx, args);

    if (!user) {
      throw new Error("User not found");
    }

    const userClassInfo = await ctx.db
      .query("userClassInfo")
      .withIndex("by_userId_classId", (q) =>
        q.eq("userId", user._id).eq("classId", classId),
      )
      .unique();

    if (userClassInfo) {
      if (userClassInfo.userId !== user._id) {
        throw new Error("Not your class");
      }

      await ctx.db.delete(userClassInfo._id);
    }

    const userTasks = await ctx.db
      .query("userTasks")
      .withIndex("by_userId_classId", (q) =>
        q.eq("userId", user._id).eq("classId", classId),
      )
      .collect();

    await Promise.all(userTasks.map((t) => ctx.db.delete(t._id)));

    const nStudents = await ctx.db
      .query("userClassInfo")
      .withIndex("by_classId", (q) => q.eq("classId", classId))
      .collect();

    if (nStudents.length === 0) {
      await ctx.db.delete(args.classId);
    }
  },
});

export const editTargetGrade = mutation({
  args: { classId: v.id("classes"), targetGrade: v.number() },
  handler: async (ctx, args) => {
    if (args.targetGrade > 100 || args.targetGrade < 0) {
      throw new Error("Target grade must be between 0 and 100");
    }

    const user = await getUserFromClerkId(ctx, args);

    if (!user) {
      throw new Error("User not found");
    }

    const userClassInfo = await ctx.db
      .query("userClassInfo")
      .withIndex("by_userId_classId", (q) =>
        q.eq("userId", user._id).eq("classId", args.classId),
      )
      .unique();

    if (!userClassInfo) {
      throw new Error("Class not found");
    }

    if (userClassInfo.userId !== user._id) {
      throw new Error("Not your class");
    }

    await ctx.db.patch(userClassInfo._id, { targetGrade: args.targetGrade });
  },
});

export const followUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const { userId } = args;
    const authenticatedUser = await getUserFromClerkId(ctx, args);

    if (!authenticatedUser) {
      throw new Error("User not found");
    }

    if (authenticatedUser._id === userId) {
      throw new Error("Cannot follow yourself");
    }

    const userFollowingInfo = await ctx.db
      .query("followingsInfo")
      .withIndex("by_userId_followingId", (q) =>
        q.eq("userId", authenticatedUser._id).eq("followingId", userId),
      )
      .unique()
      .catch(() => null);

    if (userFollowingInfo) {
      if (userFollowingInfo.status === "blocked") {
        throw new Error("Blocked");
      } else {
        await ctx.db.delete(userFollowingInfo._id);
      }
    } else {
      const otherUserProfile = await ctx.db
        .query("profiles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique()
        .catch(() => null);

      if (!otherUserProfile) {
        throw new Error("User not found");
      }

      await ctx.db.insert("followingsInfo", {
        userId: authenticatedUser._id,
        followingId: args.userId,
        status: otherUserProfile.isPrivate ? "requested" : "accepted",
      });
    }
  },
});

export const setLoginStats = mutation({
  handler: async (ctx, args) => {
    const authenticatedUser = await getUserFromClerkId(ctx, args);

    if (!authenticatedUser) {
      throw new Error("User not found");
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", authenticatedUser._id))
      .unique()
      .catch(() => null);

    if (!profile) {
      throw new Error("User profile not found");
    }

    await ctx.db.patch(profile._id, {
      lastSeenAt: Date.now(),
    });
  },
});

export const updateProfile = mutation({
  args: v.object({
    updatedUserInfo: v.object({
      givenName: v.optional(v.string()),
      familyName: v.optional(v.string()),
      username: v.optional(v.string()),
      pictureUrl: v.optional(v.string()),
    }),
    updatedProfileInfo: v.object({
      major: v.optional(v.string()),
      school: v.optional(v.string()),
      academicYear: v.optional(v.number()),
      isPrivate: v.optional(v.boolean()),
      bio: v.optional(v.string()),
      city: v.optional(v.string()),
    }),
  }),
  handler: async (ctx, args) => {
    const authenticatedUser = await getUserFromClerkId(ctx, args);

    if (!authenticatedUser) {
      throw new Error("User not found");
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", authenticatedUser._id))
      .unique()
      .catch(() => null);

    if (!profile) {
      throw new Error("User profile not found");
    }

    if (profile.userId !== authenticatedUser._id) {
      throw new Error("Not your profile");
    }

    const { updatedUserInfo, updatedProfileInfo } = args;

    await Promise.all([
      ctx.db.patch(authenticatedUser._id, {
        ...updatedUserInfo,
        pictureUrl: updatedUserInfo.pictureUrl ?? undefined,
      }),
      ctx.db.patch(profile._id, {
        ...updatedProfileInfo,
        bio: updatedProfileInfo.bio ?? undefined,
        city: updatedProfileInfo.city ?? undefined,
      }),
    ]);
  },
});

export const removeProfilePicture = mutation({
  handler: async (ctx, args) => {
    const authenticatedUser = await getUserFromClerkId(ctx, args);

    if (!authenticatedUser) {
      throw new Error("User not found");
    }

    await ctx.db.patch(authenticatedUser._id, {
      pictureUrl: undefined,
    });
  },
});

export const generateUploadUrl = mutation({
  returns: v.string(),
  handler: async (ctx, _args) => {
    await authorize(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const setBannerPicture = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const { storageId } = args;

    const authenticatedUser = await getUserFromClerkId(ctx, args);

    if (!authenticatedUser) {
      throw new Error("User not found");
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", authenticatedUser._id))
      .unique()
      .catch(() => null);

    if (!profile) {
      throw new Error("User profile not found");
    }

    if (profile.userId !== authenticatedUser._id) {
      throw new Error("Not your profile");
    }

    if (profile.bannerId) {
      await ctx.storage.delete(profile.bannerId);
    }

    await ctx.db.patch(profile._id, {
      bannerId: storageId,
    });
  },
});

export const removeBannerPicture = mutation({
  handler: async (ctx, args) => {
    const authenticatedUser = await getUserFromClerkId(ctx, args);

    if (!authenticatedUser) {
      throw new Error("User not found");
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", authenticatedUser._id))
      .unique()
      .catch(() => null);

    if (!profile) {
      throw new Error("User profile not found");
    }

    if (profile.userId !== authenticatedUser._id) {
      throw new Error("Not your profile");
    }

    const bannerId = profile.bannerId;

    if (bannerId) {
      await ctx.storage.delete(bannerId);
    }

    await ctx.db.patch(profile._id, {
      bannerId: undefined,
    });
  },
});

export const newUserPost = mutation({
  args: { description: v.string(), imageId: v.optional(v.id("_storage")) },
  handler: async (ctx, args) => {
    const { description, imageId } = args;
    const authenticatedUser = await getUserFromClerkId(ctx, args);

    if (!authenticatedUser) {
      throw new Error("User not found");
    }

    const user = await ctx.db.get(authenticatedUser._id);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.state !== "active") {
      throw new Error("User not active");
    }

    const postId = await ctx.db.insert("posts", {
      description,
      imageId,
      likes: [],
    });

    await ctx.db.insert("userPosts", {
      userId: authenticatedUser._id,
      postId,
    });
  },
});
