import z from "zod";
import { SignatureService } from "./signatureService";

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
  #signatureService: SignatureService;

  constructor(signatureService: SignatureService) {
    this.#signatureService = signatureService;
  }

  static async new(): Promise<TokenService> {
    const signatureService = await SignatureService.new(
      signingPublicKey,
      signingPrivateKey,
    );

    return new TokenService(signatureService);
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

    const encodedHeader = btoa(JSON.stringify(header));

    const token: Token = {
      payload,
      claims,
    };

    const encodedToken = btoa(JSON.stringify(token));

    const signedToken = await this.#signatureService.sign(encodedToken);

    // jwt format
    return `${encodedHeader}.${encodedToken}.${signedToken}`;
  }

  async verify(tokenString: string): Promise<Payload | null> {
    const [_, encodedToken, signedToken] = tokenString.split(".");

    const validSignature = await this.#signatureService.verify(
      signedToken,
      encodedToken,
    );

    if (!validSignature) {
      return null;
    }

    const decodedToken = JSON.parse(atob(encodedToken));

    const res = Token.safeParse(JSON.parse(decodedToken));

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
