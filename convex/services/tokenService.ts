import z from "zod";
import { EncryptionService } from "./encryptionService";
import { SignatureService } from "./signatureService";
import { en } from "zod/locales";

const publicKey = process.env.RSA_PUBLIC_KEY!;
const privateKey = process.env.RSA_PRIVATE_KEY!;
const signingPublicKey = process.env.RSA_SIGNING_PUBLIC_KEY!;
const signingPrivateKey = process.env.RSA_SIGNING_PRIVATE_KEY!;

export const Header = z.object({
  alg: z.string(),
  typ: z.string(),
});

export const Payload = z.object({
  // custom claims
  userId: z.string(),
  privileges: z.array(z.string()),
});

export const Claims = z.object({
  // more on claims: https://datatracker.ietf.org/doc/html/rfc7519#section-4.1
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

export type Header = z.infer<typeof Header>;
export type Payload = z.infer<typeof Payload>;
export type Claims = z.infer<typeof Claims>;
export type Token = z.infer<typeof Token>;

export class TokenService {
  #encryptionService: EncryptionService;
  #signatureService: SignatureService;

  constructor(
    encryptionService: EncryptionService,
    signatureService: SignatureService,
  ) {
    this.#encryptionService = encryptionService;
    this.#signatureService = signatureService;
  }

  static async new(): Promise<TokenService> {
    const encryptionService = await EncryptionService.new(
      publicKey,
      privateKey,
    );
    const signatureService = await SignatureService.new(
      signingPublicKey,
      signingPrivateKey,
    );

    return new TokenService(encryptionService, signatureService);
  }

  async sign(payload: Payload): Promise<string> {
    const header: Header = {
      alg: "RS256",
      typ: "JWT",
    };

    const claims: Claims = {
      iss: "campusclip.api",
      sub: payload.userId,
      aud: "campusclip.api",
      exp: Math.floor(Date.now() / 1000) + 10, // add 10 seconds for testing
      iat: Math.floor(Date.now() / 1000),
    };

    const encryptedHeader = await this.#encryptionService.encrypt(
      JSON.stringify(header),
    );

    const token: Token = {
      payload,
      claims,
    };

    const encryptedToken = await this.#encryptionService.encrypt(
      JSON.stringify(token),
    );

    const signedToken = await this.#signatureService.sign(encryptedToken);

    // jwt format
    return `${encryptedHeader}.${encryptedToken}.${signedToken}`;
  }

  async verify(tokenString: string): Promise<Payload | null> {
    const [_, encryptedToken, signedToken] = tokenString.split(".");

    const validSignature = await this.#signatureService.verify(
      signedToken,
      encryptedToken,
    );

    if (!validSignature) {
      return null;
    }

    const decryptedToken =
      await this.#encryptionService.decrypt(encryptedToken);

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
}

export async function generateSalt(): Promise<string> {
  const array = new Uint32Array(4);
  crypto.getRandomValues(array);
  const salt = array.join("");
  return salt;
}

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
