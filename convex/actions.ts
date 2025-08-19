"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import jwt from "jsonwebtoken";
import z from "zod";
import { internal } from "./_generated/api";

const Payload = z.object({
  userId: z.string(),
});
type Payload = z.infer<typeof Payload>;

const publicKeyBase64 = process.env.RSA_PUBLIC_KEY!;
const privateKeyBase64 = process.env.RSA_PRIVATE_KEY!;

export const issueToken = action({
  args: { userId: v.id("users") },
  handler: async (_, args) => {
    const payload: Payload = { userId: args.userId };

    const token = jwt.sign(payload, privateKeyBase64, {
      algorithm: "RS256",
      issuer: "campusclip.api",
      audience: "campusclip.api",
      subject: args.userId,
    });
    return token;
  },
});

export const verifyToken = action({
  args: { token: v.string() },
  handler: async (ctx, args): Promise<boolean> => {
    const decoded = jwt.verify(args.token, publicKeyBase64, {
      algorithms: ["RS256"],
      issuer: "campusclip.api",
      audience: "campusclip.api",
    });

    const res = Payload.safeParse(decoded);

    if (!res.success) {
      return false;
    }

    const userId = res.data.userId;

    const exists = await ctx.runQuery(internal.utils.checkIfUserExists, {
      userId,
    });
    return exists;
  },
});
