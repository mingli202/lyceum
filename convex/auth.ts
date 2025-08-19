import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { api } from "./_generated/api";
import { issueToken } from "./token";

export const registerUser = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const { email, password } = args;

    const salt = btoa(
      String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))),
    );

    const passwordWithSalt = new TextEncoder().encode(password + salt);

    const hashedPassword = await crypto.subtle.digest(
      { name: "SHA-256" },
      passwordWithSalt,
    );

    const hashedPasswordString = btoa(
      String.fromCharCode(...new Uint8Array(hashedPassword)),
    );

    const userId = await ctx.db.insert("users", {
      email,
      password: hashedPasswordString,
      salt,
    });

    const token = await issueToken(userId);
    return token;
  },
});

// export const loginUser = query({});
