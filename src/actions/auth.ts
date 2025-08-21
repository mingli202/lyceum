"use server";

import { Credentials } from "@/types";
import { fetchAction } from "convex/nextjs";
import { cookies } from "next/headers";
import { api } from "../../convex/_generated/api";

export type LoginOptions = {
  credentials?: Credentials;
  setCookies?: boolean; // can't set cookies in server components
};

export async function login(
  options: LoginOptions = {},
): Promise<{ ok: boolean }> {
  const { credentials, setCookies } = options;

  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  let newToken: string | null = null;

  if (credentials) {
    newToken = await fetchAction(
      api.actions.loginWithCredentials,
      credentials,
    ).catch(() => null);
  } else if (token) {
    newToken = await fetchAction(api.actions.validateTokenWithPrivileges, {
      token: token.value,
      requestedPrivileges: [],
    }).catch(() => null);
  }

  if (newToken) {
    if (setCookies) {
      cookieStore.set("token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
    }
    return { ok: true };
  }

  if (setCookies) {
    cookieStore.delete("token");
  }

  return { ok: false };
}

export async function registerUser(
  credentials: Credentials,
): Promise<{ ok: boolean }> {
  const token = await fetchAction(api.actions.registerUser, credentials).catch(
    () => null,
  );

  if (token) {
    const cookieStore = await cookies();

    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    return { ok: true };
  }

  return { ok: false };
}
