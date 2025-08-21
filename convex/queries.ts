import { v } from "convex/values";
import { query } from "./_generated/server";
import { Profile } from "./types";
import { TokenService } from "./services/tokenService";

export const getUserProfile = query({
  args: { token: v.string() },
  handler: async (ctx, args): Promise<Profile | null> => {
    const tokenService = await TokenService.new();
    const res = await tokenService.verify(args.token);

    if (!res) {
      return null;
    }

    const userId = res.userId;

    return await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});
