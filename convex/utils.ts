import {
  GenericActionCtx,
  GenericMutationCtx,
  GenericQueryCtx,
} from "convex/server";
import { DataModel } from "./_generated/dataModel";
import { SignatureService } from "./services/signatureService";

/**
 * Helper function to authorize a request.
 * On the client, requests using convex sends the right jwt token.
 * On the server however, we don't have access to the jwt token since it's stored in the browser's cookies.
 * So we need to manually verify the signature by signing the body with the `SignatureService` class.
 * */
export async function authorize(
  ctx:
    | GenericMutationCtx<DataModel>
    | GenericQueryCtx<DataModel>
    | GenericActionCtx<DataModel>,
  signature?: string,
) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    if (!signature) {
      throw new Error("Unauthenticated");
    }

    const signatureService = new SignatureService();
    const [bodyStr, bodySignature] = signature.split(".");

    const isValidSignature = await signatureService.verify(
      bodySignature,
      bodyStr,
    );

    if (!isValidSignature) {
      throw new Error("Invalid signature");
    }
  }
}
