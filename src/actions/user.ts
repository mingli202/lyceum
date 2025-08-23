"use server";

import { fetchMutation } from "convex/nextjs";
import { SignatureService } from "../../convex/services/signatureService";
import { api } from "../../convex/_generated/api";
import { CreateNewUserArgs } from "../../convex/types";

const signatureService = new SignatureService();

export async function createNewUser(
  formData: FormData,
): Promise<string | null> {
  const clerkId = formData.get("clerkId")?.toString();
  const school = formData.get("school")?.toString();
  const major = formData.get("major")?.toString();
  const firstName = formData.get("first-name")?.toString();
  const lastName = formData.get("last-name")?.toString();
  const username = formData.get("username")?.toString();
  const academicYear = formData.get("academic-year")?.toString();
  const city = formData.get("city")?.toString();
  const email = formData.get("email")?.toString();
  const pictureUrl = formData.get("pictureUrl")?.toString();
  const bio = formData.get("bio")?.toString();

  if (
    !school ||
    !major ||
    !firstName ||
    !username ||
    !academicYear ||
    !email ||
    !clerkId
  ) {
    console.log("email:", email);
    return "Please fill out all required fields";
  }

  const body: Omit<CreateNewUserArgs, "signature"> = {
    clerkId,
    school,
    major,
    firstName,
    lastName,
    username,
    academicYear: parseInt(academicYear),
    city,
    email,
    pictureUrl,
    bio,
  };

  const signature = await signatureService.sign(body);

  return await fetchMutation(api.mutations.createNewUser, {
    ...body,
    signature,
  }).catch(() => "Oops, something went wrong");
}
