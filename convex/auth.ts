import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { hashPassword, issueToken, verifyToken } from "./tokenService";
import { Id } from "./_generated/dataModel";

export const registerUser = mutation({
  args: { email: v.string(), password: v.string() },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args): Promise<string | null> => {
    const { email, password } = args;

    // emails must be unique
    const exists =
      (await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .unique()) !== null;

    if (exists) {
      return null;
    }

    const salt = btoa(
      String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))),
    );

    const hashedPasswordString = await hashPassword(password, salt);

    const userId = await ctx.db.insert("users", {
      email,
      password: hashedPasswordString,
      salt,
    });

    const token = await issueToken(userId);
    return token;
  },
});

// new token on successful login
export const loginWithCredentials = query({
  args: { email: v.string(), password: v.string() },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args): Promise<string | null> => {
    const { email, password } = args;

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!user) {
      return null;
    }

    const salt = user.salt;
    const hashedPasswordString = await hashPassword(password, salt);

    if (hashedPasswordString !== user.password) {
      return null;
    }

    const token = await issueToken(user._id);
    return token;
  },
});

export const loginWithToken = query({
  args: { token: v.string() },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args): Promise<string | null> => {
    const payload = await verifyToken(args.token);

    if (!payload) {
      return null;
    }

    const exists =
      (await ctx.db
        .query("users")
        .withIndex("by_id", (q) => q.eq("_id", payload.userId as Id<"users">))
        .unique()) !== null;

    const token = await issueToken(payload.userId);

    return exists ? token : null;
  },
});
