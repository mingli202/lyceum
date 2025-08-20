"use server";

import { Credentials } from "@/types";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { cookies } from "next/headers";
import { api } from "../../convex/_generated/api";
import { EncryptionService } from "../../shared/services/encryptionService";

const publicKey = process.env.RSA_PUBLIC_KEY!;
const privateKey = process.env.RSA_PRIVATE_KEY!;

const encryptionService = await EncryptionService.new(publicKey, privateKey);

export async function login(
  credentials?: Credentials,
): Promise<{ ok: boolean }> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  let newToken: string | null = null;

  if (credentials) {
    newToken = await fetchQuery(api.auth.loginWithCredentials, credentials);
  } else if (token) {
    newToken = await fetchQuery(api.auth.loginWithToken, {
      token: token.value,
    });
  }

  if (newToken) {
    const encryptedToken = await encryptionService.encrypt(newToken);
    cookieStore.set("token", encryptedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    return { ok: true };
  }

  return { ok: false };
}

export async function registerUser(
  credentials: Credentials,
): Promise<{ ok: boolean }> {
  const token = await fetchMutation(api.auth.registerUser, credentials);

  if (token) {
    const cookieStore = await cookies();

    const encryptedToken = await encryptionService.encrypt(token);
    cookieStore.set("token", encryptedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    return { ok: true };
  }

  return { ok: false };
}
