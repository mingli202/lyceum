"use server";

import { Credentials } from "@/types";
import { fetchAction } from "convex/nextjs";
import { cookies } from "next/headers";
import { api } from "../../convex/_generated/api";

export async function login(
  credentials?: Credentials,
): Promise<{ ok: boolean }> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  let newToken: string | null = null;

  if (credentials) {
    newToken = await fetchAction(api.actions.loginWithCredentials, credentials);
  } else if (token) {
    newToken = await fetchAction(api.actions.validateTokenWithPrivileges, {
      token: token.value,
      requestedPrivileges: [],
    });
  }

  if (newToken) {
    // const encryptedToken = await encryptionService.encrypt(newToken);
    cookieStore.set("token", newToken, {
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
  const token = await fetchAction(api.actions.registerUser, credentials);

  if (token) {
    const cookieStore = await cookies();

    // const encryptedToken = await encryptionService.encrypt(token);
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    return { ok: true };
  }

  return { ok: false };
}
