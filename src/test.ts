import { SignatureService } from "../convex/services/signatureService";
import { TokenService } from "../convex/services/tokenService";

export async function test() {
  const tokenService = await TokenService.new();
  const token = await tokenService.sign({
    userId: "1",
    privileges: [],
  });
  // console.log("token:", token);

  const payload = await tokenService.verify(token);
  console.log("payload:", payload);

  // const signatureService = await SignatureService.new(
  //   process.env.RSA_SIGNING_PUBLIC_KEY!,
  //   process.env.RSA_SIGNING_PRIVATE_KEY!,
  // );
  // const data = atob("hello world");
  // const signature = await signatureService.sign(data);
  // console.log("signature:", signature);
  //
  // const validSignature = await signatureService.verify(signature, data);
  // console.log("validSignature:", validSignature);
}

test();
