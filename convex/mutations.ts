import { v } from "convex/values";
import { internalMutation, mutation } from "./_generated/server";
import { authorize, getUserFromClerkId } from "./utils";
import { internal } from "./_generated/api";
import { AddClassArgs, CreateNewUserArgs } from "./types";
import { Id } from "./_generated/dataModel";

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
    });

    await ctx.db.insert("profiles", {
      userId,
      following: [],
      followers: [],
      clubs: [],
      chats: [],

      major: args.major,
      school: args.school,
      username: args.username.replace(/\s/g, "_"),
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

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (!profile) {
      throw new Error("User profile not found");
    }

    // search if the class already exists
    const existingClass = await ctx.db
      .query("classes")
      .withIndex("by_school_code", (q) =>
        q.eq("school", profile.school).eq("code", args.code),
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
        school: profile.school,
      });
    }

    await ctx.db.insert("userClassInfo", {
      userId: user._id,
      classId,
      targetGrade: args.targetGrade,
      tasks: [],
    });

    return "ok" as const;
  },
});

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
