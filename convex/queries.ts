import { internalQuery, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { DashboardData, User } from "./types";
import schema from "./schema";
import { authorize } from "./utils";

export const getUserIdFromClerkId = internalQuery({
  args: { signature: v.optional(v.string()) },
  returns: v.union(v.id("users"), v.null()),
  handler: async (ctx, args): Promise<Id<"users"> | null> => {
    const clerkId = await authorize(ctx, args.signature);

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();

    return user?._id ?? null;
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
    const userId = await ctx.runQuery(
      internal.queries.getUserIdFromClerkId,
      args,
    );

    if (!userId) {
      return "N/A";
    }

    const user = await ctx.db.get(userId);

    return user ?? "N/A";
  },
});

export const getDashboardData = query({
  args: { signature: v.string() },
  returns: DashboardData,
  handler: async (ctx, args): Promise<DashboardData> => {
    const userId = await ctx.runQuery(
      internal.queries.getUserIdFromClerkId,
      args,
    );

    const noInfo = { classesInfo: [] };

    if (!userId) {
      return noInfo;
    }

    const classesInfo = await ctx.db
      .query("userClassInfo")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    let average = 0;

    const classes: DashboardData["classesInfo"] = (
      await Promise.all(
        classesInfo.map(async (cl) => {
          const classId = cl.classId;
          const classInfo = await ctx.db.get(classId);

          if (!classInfo) {
            return null;
          }

          const userTasks = await ctx.db
            .query("userTasks")
            .withIndex("by_userId_classId", (q) =>
              q.eq("userId", userId).eq("classId", classId),
            )
            .collect();

          const grade = userTasks.reduce(
            (acc, task) =>
              acc +
              task.weight *
                (task.scoreTotal === 0 ||
                (task.status !== "active" && task.status !== "completed")
                  ? 0
                  : task.scoreTotal / task.scoreTotal),
            0,
          );

          average += grade;

          return {
            code: classInfo.code,
            title: classInfo.title,
            professor: classInfo.professor,
            _id: classInfo._id,
            grade,
          };
        }),
      )
    ).filter((classInfo) => classInfo !== null);

    average /= classes.length;

    return {
      classesInfo: classes,
      average,
    };
  },
});
