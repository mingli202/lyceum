import {
  GenericActionCtx,
  GenericMutationCtx,
  GenericQueryCtx,
} from "convex/server";
import { DataModel, Id } from "./_generated/dataModel";
import { SignatureService } from "./services/signatureService";
import { internal } from "./_generated/api";
import { User } from "./types";

/**
 * Helper function to authorize a request.
 * On the client, requests using convex sends the right jwt token.
 * On the server however, we don't have access to the jwt token since it's stored in the browser's cookies.
 * So we need to manually verify the signature by signing the body with the `SignatureService` class.
 * @param ctx - The context of the request.
 * @param signature - The signature of the request.
 * @returns The user's clerkId.
 * */
export async function authorize(
  ctx:
    | GenericMutationCtx<DataModel>
    | GenericQueryCtx<DataModel>
    | GenericActionCtx<DataModel>,
  signature?: string,
): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    if (!signature) {
      throw new Error("Unauthenticated");
    }

    const signatureService = new SignatureService();

    const body =
      await signatureService.verify<Record<string | number | symbol, unknown>>(
        signature,
      );

    if ("clerkId" in body) {
      return body["clerkId"] as string;
    } else {
      throw new Error("Could not find clerkId in body");
    }
  } else {
    return identity["user_id"] as string;
  }
}

/**
 * Helper function to get the userId from the clerkId.
 * Because it's too long and I'm lazy to write it out every time.
 * */
export async function getUserFromClerkId(
  ctx:
    | GenericMutationCtx<DataModel>
    | GenericQueryCtx<DataModel>
    | GenericActionCtx<DataModel>,
  args: any & { signature: string },
): Promise<User | null> {
  return await ctx.runQuery(internal.queries._getUserFromClerkId, {
    signature: args.signature,
  });
}

export async function canViewUserInfo(
  ctx:
    | GenericMutationCtx<DataModel>
    | GenericQueryCtx<DataModel>
    | GenericActionCtx<DataModel>,
  authenticatedUserId: Id<"users">,
  requestedUserId?: Id<"users">,
): Promise<{ canView: boolean; reason?: string }> {
  return await ctx.runQuery(internal.queries._canViewUserInfo, {
    requestedUserId,
    authenticatedUserId,
  });
}
