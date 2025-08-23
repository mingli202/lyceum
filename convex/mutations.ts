import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { SignatureService } from "./services/signatureService";

export const CreateNewUserArgs = v.object({
  signature: v.optional(v.string()),
  school: v.string(),
  major: v.string(),
  firstName: v.string(),
  lastName: v.optional(v.string()),
  username: v.string(),
  academicYear: v.number(),
  city: v.optional(v.string()),
  email: v.string(),
  pictureUrl: v.optional(v.string()),
  userId: v.string(),
  bio: v.optional(v.string()),
});
export type CreateNewUserArgs = typeof CreateNewUserArgs.type;

export const createNewUser = mutation({
  args: CreateNewUserArgs,
  returns: v.literal("ok"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      if (!args.signature) {
        throw new Error("Unauthenticated");
      }

      const signatureService = new SignatureService();
      const [bodyStr, signature] = args.signature.split(".");

      const isValidSignature = await signatureService.verify(
        signature,
        bodyStr,
      );

      if (!isValidSignature) {
        throw new Error("Invalid signature");
      }
    } else {
      const clerkId = identity["user_id"];

      if (clerkId !== args.userId) {
        throw new Error("User ID mismatch");
      }
    }

    if (
      await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", args.userId))
        .unique()
        .catch(() => null)
    ) {
      throw new Error("User already exists or error");
    }

    const userId = await ctx.db.insert("users", {
      clerkId: args.userId,
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
      classes: [],

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

export const createNewClass = mutation({
  args: {
    code: v.string(),
    student: v.id("users"),
    title: v.string(),
    professor: v.string(),
    university: v.string(),
    semester: v.union(
      v.literal("Summer"),
      v.literal("Fall"),
      v.literal("Winter"),
    ),
    year: v.number(),
    credits: v.number(),
    classTimes: v.array(
      v.object({
        day: v.union(
          v.literal("Monday"),
          v.literal("Tuesday"),
          v.literal("Wednesday"),
          v.literal("Thursday"),
          v.literal("Friday"),
          v.literal("Saturday"),
          v.literal("Sunday"),
        ),
        start: v.string(),
        end: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const newChat = await ctx.db.insert("chats", {
      title: `${args.title} Chat`,
      members: [args.student],
    });

    const classId = await ctx.db.insert("classes", {
      code: args.code,
      chat: newChat,
      students: [args.student],

      title: args.title,
      professor: args.professor,
      university: args.university,
      semester: args.semester,
      year: args.year,
      credits: args.credits,
      classTimes: args.classTimes,
    });

    return classId;
  },
});
