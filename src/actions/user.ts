"use server";

import { fetchMutation } from "convex/nextjs";
import { SignatureService } from "../../convex/services/signatureService";
import { api } from "../../convex/_generated/api";
import { CreateNewUserArgs } from "../../convex/mutations";

const signatureService = new SignatureService();

export async function createNewUser(formData: FormData) {
  const userId = formData.get("userId")?.toString();
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
    !userId
  ) {
    console.log("email:", email);
    return "Please fill out all required fields";
  }

  const body: Omit<CreateNewUserArgs, "signature"> = {
    userId,
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

  const bodyStr = btoa(JSON.stringify(body));

  const signature = await signatureService.sign(bodyStr);

  return await fetchMutation(api.mutations.createNewUser, {
    ...body,
    signature: `${bodyStr}.${signature}`,
  }).catch(() => "Oops, something went wrong");
}
