import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { CustomClaims, TokenService } from "./services/tokenService";
import { internal } from "./_generated/api";

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

export const getUserPasswordFromEmail = internalQuery({
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
    const user = await ctx.db.get<"users">(args.userId);

    if (!user) {
      return null;
    }

    return user.privileges;
  },
});

export const validateTokenWithPrivileges = internalQuery({
  args: { token: v.string(), requestedPrivileges: v.array(v.string()) },
  returns: v.union(
    v.object({ userId: v.string(), privileges: v.array(v.string()) }),
    v.null(),
  ),
  handler: async (ctx, args): Promise<CustomClaims | null> => {
    const tokenService = await TokenService.new();
    const customClaims = await tokenService.verify(args.token);

    if (!customClaims) {
      return null;
    }

    // check for privileges and if user exists as well
    const userId = customClaims.userId as Id<"users">;
    const userPrivileges = await ctx.runQuery(internal.auth.getUserPrivileges, {
      userId,
    });

    if (!userPrivileges) {
      return null;
    }

    // if user wants privileges, check if they are allowed
    if (args.requestedPrivileges.length > 0) {
      if (
        args.requestedPrivileges.some(
          (privilege) => !userPrivileges.includes(privilege),
        )
      ) {
        return null;
      }
    }

    return customClaims;
  },
});
