import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { hashPassword } from "./utils";
import { TokenService } from "./services/tokenService";

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
