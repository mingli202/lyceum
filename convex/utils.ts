import { v } from "convex/values";
import { internalQuery } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const checkIfUserExists = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args): Promise<boolean> => {
    const user = await ctx.db.get(args.userId as Id<"users">);
    return user !== null;
  },
});
