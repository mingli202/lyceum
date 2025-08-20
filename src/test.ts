import { TokenService } from "../convex/services/tokenService";

export async function test() {
  const tokenService = await TokenService.new();
  const token = await tokenService.sign({
    userId: "1",
    privileges: [],
  });

  const payload = await tokenService.verify(token);
  console.log("payload:", payload);
}

test();
