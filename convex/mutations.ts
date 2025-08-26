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
      privileges: [],
      givenName: args.firstName,
      familyName: args.lastName,
      pictureUrl: args.pictureUrl,
      email: args.email,
      username: args.username.replace(/\s/g, "_"),
    });

    await ctx.db.insert("profiles", {
      userId,
      following: [],
      followers: [],
      clubs: [],
      chats: [],

      major: args.major,
      school: args.school,
      bio: args.bio,
      city: args.city,
      academicYear: args.academicYear,
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
    console.log(updatedTask);

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

    if (userClassInfo) {
      await ctx.db.delete(userClassInfo._id);
    }

    const nStudents = await ctx.db
      .query("userClassInfo")
      .withIndex("by_classId", (q) => q.eq("classId", args.classId))
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

    const classInfo = await ctx.db
      .query("userClassInfo")
      .withIndex("by_userId_classId", (q) =>
        q.eq("userId", user._id).eq("classId", args.classId),
      )
      .unique();

    if (!classInfo) {
      throw new Error("Class not found");
    }

    await ctx.db.patch(classInfo._id, { targetGrade: args.targetGrade });
  },
});
