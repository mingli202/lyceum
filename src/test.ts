import { SignatureService } from "../convex/services/signatureService";
import { TokenService } from "../convex/services/tokenService";

const publicKeyString = process.env.RSA_SIGNING_PUBLIC_KEY!;
const privateKeyString = process.env.RSA_SIGNING_PRIVATE_KEY!;

export async function test() {
  const tokenService = await TokenService.new();
  const token = await tokenService.sign({
    userId: "1",
    privileges: [],
  });
  console.log("token:", token);

  const payload = await tokenService.verify(token);
  console.log("payload:", payload);
}

test();
