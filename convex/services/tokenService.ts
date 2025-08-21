import z from "zod";
import { SignatureService } from "./signatureService";

const signingPublicKey = process.env.RSA_SIGNING_PUBLIC_KEY!;
const signingPrivateKey = process.env.RSA_SIGNING_PRIVATE_KEY!;

export const Header = z.object({
  alg: z.string(),
  typ: z.string(),
});

export const CustomClaims = z.object({
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

export const Payload = z.object({
  ...Claims.shape,
  ...CustomClaims.shape,
});

export type Header = z.infer<typeof Header>;
export type CustomClaims = z.infer<typeof CustomClaims>;
export type Claims = z.infer<typeof Claims>;
export type Payload = z.infer<typeof Payload>;

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

  async sign(customClaims: CustomClaims): Promise<string> {
    const header: Header = {
      alg: "RS256",
      typ: "JWT",
    };

    const claims: Claims = {
      iss: "campusclip.api",
      sub: customClaims.userId,
      aud: "campusclip.api",
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 * 4, // add 4 months ~ average semester length
      iat: Math.floor(Date.now() / 1000),
    };

    const encodedHeader = btoa(JSON.stringify(header));

    const token: Payload = {
      ...claims,
      ...customClaims,
    };

    const encodedToken = btoa(JSON.stringify(token));

    const signedToken = await this.#signatureService.sign(encodedToken);

    // jwt format but it's actually our own variant
    const jwt = `${encodedHeader}.${encodedToken}.${signedToken}`;
    return jwt;
  }

  /**
   * Verifies the token and returns the custom claims if valid.
   * */
  async verify(tokenString: string): Promise<CustomClaims | null> {
    const [_, encodedToken, signedToken] = tokenString.split(".");

    const validSignature = await this.#signatureService.verify(
      signedToken,
      encodedToken,
    );

    if (!validSignature) {
      return null;
    }

    const decodedToken = JSON.parse(atob(encodedToken));

    const res = Payload.safeParse(decodedToken);

    if (!res.success) {
      return null;
    }

    const token = res.data;

    // check claims
    if (
      token.iss !== "campusclip.api" ||
      token.aud !== "campusclip.api" ||
      token.sub !== token.userId ||
      token.exp < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    const customClaims: CustomClaims = {
      userId: token.userId,
      privileges: token.privileges,
    };

    return customClaims;
  }
}
