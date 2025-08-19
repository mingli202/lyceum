"use server";

import { Credentials } from "@/types";
import { fetchQuery } from "convex/nextjs";
import { api } from "../convex/_generated/api";
import { cookies } from "next/headers";

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
    cookieStore.set("token", newToken);
    return { ok: true };
  }

  return { ok: false };
}
