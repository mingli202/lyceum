import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const registerUser = internalMutation({
  args: { email: v.string(), password: v.string(), salt: v.string() },
  returns: v.union(v.id("users"), v.null()),
  handler: async (ctx, args): Promise<Id<"users"> | null> => {
    const { email, password, salt } = args;

    // emails must be unique
    const exists =
      (await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .unique()) !== null;

    if (exists) {
      return null;
    }

    const userId = await ctx.db.insert("users", {
      email,
      password,
      salt,
      privileges: [],
    });

    return userId;
  },
});

// new token on successful login
export const getUserCredentials = internalQuery({
  args: { email: v.string() },
  returns: v.union(
    v.object({ storedPasswordHash: v.string(), storedSalt: v.string() }),
    v.null(),
  ),
  handler: async (
    ctx,
    args,
  ): Promise<{ storedPasswordHash: string; storedSalt: string } | null> => {
    const { email } = args;

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!user) {
      return null;
    }

    return { storedPasswordHash: user.password, storedSalt: user.salt };
  },
});

export const getUserPrivileges = internalQuery({
  args: { userId: v.id("users") },
  returns: v.union(v.array(v.string()), v.null()),
  handler: async (ctx, args): Promise<string[] | null> => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_id", (q) => q.eq("_id", args.userId as Id<"users">))
      .unique();

    if (!user) {
      return null;
    }

    return user.privileges;
  },
});
