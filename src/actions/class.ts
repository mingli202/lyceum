"use server";

import { fetchMutation } from "convex/nextjs";
import { SignatureService } from "../../convex/services/signatureService";
import { AddClassArgs } from "../../convex/types";
import { api } from "../../convex/_generated/api";
import { auth } from "@clerk/nextjs/server";

export async function addClass(
  formData: FormData,
  classTimes: AddClassArgs["classTimes"],
) {
  const { userId } = await auth();

  const title = formData.get("class-title")!.toString();
  const code = formData.get("class-code")!.toString();
  const professor = formData.get("class-prof")!.toString();
  const semester = formData.get("class-semester")!.toString();
  const year = formData.get("class-year")!.toString();
  const credits = formData.get("class-credits")!.toString();
  const targetGrade = formData.get("class-target-grade")!.toString();

  if (!["Summer", "Fall", "Winter"].includes(semester)) {
    throw new Error("Invalid semester");
  }

  const body: AddClassArgs = {
    code,
    title,
    professor,
    semester: semester as AddClassArgs["semester"],
    year: parseInt(year),
    credits: parseInt(credits),
    classTimes,
    targetGrade: parseInt(targetGrade),
    tasks: [],
  };

  const signature = await new SignatureService().sign({
    clerkId: userId,
    ...body,
  });

  return await fetchMutation(api.mutations.addClass, {
    ...body,
    signature,
  }).catch(() => "Couldn't add class");
}
