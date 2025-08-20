export async function hashPassword(
  password: string,
  salt?: string,
): Promise<{ hashedPassword: string; salt: string }> {
  salt ??= btoa(
    String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))),
  );

  const passwordWithSalt = new TextEncoder().encode(password + salt);

  const hash = await crypto.subtle.digest(
    { name: "SHA-256" },
    passwordWithSalt,
  );

  const hashedPassword = btoa(String.fromCharCode(...new Uint8Array(hash)));

  return { hashedPassword, salt };
}
