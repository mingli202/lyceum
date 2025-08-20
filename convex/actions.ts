import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { hashPassword } from "./utils";
import { TokenService } from "./services/tokenService";
import { Id } from "./_generated/dataModel";

export const registerUser = action({
  args: { email: v.string(), password: v.string() },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const { hashedPassword, salt } = await hashPassword(args.password);

    const userId = await ctx.runMutation(internal.auth.registerUser, {
      email: args.email,
      password: hashedPassword,
      salt,
    });

    if (!userId) {
      return null;
    }

    const tokenService = await TokenService.new();
    const token = await tokenService.sign({ userId, privileges: [] });
    return token;
  },
});

export const loginWithCredentials = action({
  args: { email: v.string(), password: v.string() },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args): Promise<string | null> => {
    const creds = await ctx.runQuery(internal.auth.getUserCredentials, {
      email: args.email,
    });

    if (!creds) {
      return null;
    }

    const { storedPasswordHash, storedSalt } = creds;

    const { hashedPassword } = await hashPassword(args.password, storedSalt);

    if (hashedPassword !== storedPasswordHash) {
      return null;
    }

    const tokenService = await TokenService.new();
    const token = await tokenService.sign({
      userId: args.email,
      privileges: [],
    });
    return token;
  },
});

export const validateTokenWithPrivileges = action({
  args: { token: v.string(), requestedPrivileges: v.array(v.string()) },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args): Promise<string | null> => {
    const tokenService = await TokenService.new();
    const payload = await tokenService.verify(args.token);

    if (!payload) {
      return null;
    }

    // if user wants privileges, check if they are allowed
    if (args.requestedPrivileges.length > 0) {
      const userId = payload.userId as Id<"users">;

      const userPrivileges = await ctx.runQuery(
        internal.auth.getUserPrivileges,
        {
          userId,
        },
      );

      if (!userPrivileges) {
        return null;
      }

      if (
        args.requestedPrivileges.some(
          (priviledge) => !userPrivileges.includes(priviledge),
        )
      ) {
        return null;
      }
    }

    const token = await tokenService.sign(payload);

    return token;
  },
});
