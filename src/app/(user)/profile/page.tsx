import { ProfileData } from "@convex/types";
import Profile from "./Profile";
import { SignatureService } from "@convex/services/signatureService";
import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@convex/_generated/api";

export default async function ProfilePage() {
  const { userId } = await auth();
  const body = { clerkId: userId };
  const signature = await new SignatureService().sign(body);

  const data = await fetchQuery(api.queries.getProfileData, {
    signature,
  });

  return <Profile data={data} />;
}
