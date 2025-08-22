import { internalQuery, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { Class, DashboardData } from "./types";

export const getUserIdFromClerkId = internalQuery({
  returns: v.union(v.id("users"), v.null()),
  handler: async (ctx, _args): Promise<Id<"users"> | null> => {
    const userIdentity = await ctx.auth.getUserIdentity();

    if (!userIdentity?.["user_id"]) {
      throw new Error("Unautenticated");
    }

    const clerkId = userIdentity["user_id"] as string;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();

    return user?._id ?? null;
  },
});

export const getDashboardData = query({
  returns: DashboardData,
  handler: async (ctx, _args): Promise<DashboardData> => {
    const noInfo = { classesInfo: [] };

    const userId = await ctx
      .runQuery(internal.queries.getUserIdFromClerkId, {})
      .catch(() => null);

    if (!userId) {
      return noInfo;
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) {
      return noInfo;
    }

    let average = 0;

    const classes: DashboardData["classesInfo"] = (
      await Promise.all(
        profile.classes.map(async (classId) => {
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
