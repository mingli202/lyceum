import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

import { TokenService } from "../shared/services/tokenService";
import { hashPassword } from "./utils";

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

    const { hashedPassword, salt } = await hashPassword(password);

    const userId = await ctx.db.insert("users", {
      email,
      password: hashedPassword,
      salt,
    });

    const tokenService = await TokenService.new();
    const token = await tokenService.sign({ userId, privileges: [] });
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
    const { hashedPassword } = await hashPassword(password, salt);

    if (hashedPassword !== user.password) {
      return null;
    }

    const tokenService = await TokenService.new();
    const token = await tokenService.sign({ userId: user._id, privileges: [] });
    return token;
  },
});

export const loginWithToken = query({
  args: { token: v.string() },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args): Promise<string | null> => {
    const tokenService = await TokenService.new();
    const payload = await tokenService.verify(args.token);

    if (!payload) {
      return null;
    }

    const exists =
      (await ctx.db
        .query("users")
        .withIndex("by_id", (q) => q.eq("_id", payload.userId as Id<"users">))
        .unique()) !== null;

    if (exists) {
      return await tokenService.sign(payload);
    } else {
      return null;
    }
  },
});
