import z from "zod";

const publicKeyBase64 = process.env.RSA_PUBLIC_KEY!;
const privateKeyBase64 = process.env.RSA_PRIVATE_KEY!;

const Payload = z.object({
  userId: z.string(),
  privileges: z.array(z.string()),
});

// more on claims: https://datatracker.ietf.org/doc/html/rfc7519#section-4.1
const Claims = z.object({
  iss: z.string(), // issuer
  sub: z.string(), // subject
  aud: z.string(), // audience
  exp: z.number(), // expiration
  iat: z.number(), // issued at
});

const Token = z.object({
  payload: Payload,
  claims: Claims,
});

type Token = z.infer<typeof Token>;
type Payload = z.infer<typeof Payload>;
type Claims = z.infer<typeof Claims>;

export async function hashPassword(
  password: string,
  salt: string,
): Promise<string> {
  const passwordWithSalt = new TextEncoder().encode(password + salt);

  const hashedPassword = await crypto.subtle.digest(
    { name: "SHA-256" },
    passwordWithSalt,
  );

  const hashedPasswordString = btoa(
    String.fromCharCode(...new Uint8Array(hashedPassword)),
  );

  return hashedPasswordString;
}

async function getKeys(): Promise<{
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}> {
  const publicKey = await crypto.subtle.importKey(
    "spki",
    Uint8Array.from(atob(publicKeyBase64), (t) => t.charCodeAt(0)),
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"],
  );

  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    Uint8Array.from(atob(privateKeyBase64), (t) => t.charCodeAt(0)),
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["decrypt"],
  );

  return { publicKey, privateKey };
}

export async function encrypt(value: string): Promise<string> {
  const { publicKey } = await getKeys();

  const textEncoder = new TextEncoder();

  const encrypted = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    textEncoder.encode(value),
  );

  const base64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));

  return base64;
}

export async function decrypt(encryptedBase64: string): Promise<string | null> {
  const { privateKey } = await getKeys();

  const decrypted = await crypto.subtle
    .decrypt(
      { name: "RSA-OAEP" },
      privateKey,
      Uint8Array.from(atob(encryptedBase64), (t) => t.charCodeAt(0)),
    )
    .then((res) => new TextDecoder().decode(res))
    .catch(() => null);

  return decrypted;
}

export async function issueToken(userId: string): Promise<string> {
  const token: Token = {
    payload: {
      userId: userId,
      privileges: [],
    },
    claims: {
      iss: "campusclip.api",
      sub: userId,
      aud: "campusclip.api",
      exp: Math.floor(Date.now() / 1000) + 10, // add 10 seconds for testing
      iat: Math.floor(Date.now() / 1000),
    },
  };

  const encryptedToken = await encrypt(JSON.stringify(token));
  return encryptedToken;
}

// return payload if valid
export async function verifyToken(
  tokenString: string,
): Promise<Payload | null> {
  const decryptedToken = await decrypt(tokenString);
  if (!decryptedToken) {
    return null;
  }

  const res = Token.safeParse(JSON.parse(decryptedToken));

  if (!res.success) {
    return null;
  }

  const token = res.data;
  const userId = res.data.payload.userId;

  // check claims
  const claims = res.data.claims;
  if (
    claims.iss !== "campusclip.api" ||
    claims.aud !== "campusclip.api" ||
    claims.sub !== userId ||
    claims.exp < Math.floor(Date.now() / 1000)
  ) {
    return null;
  }

  return token.payload;
}
