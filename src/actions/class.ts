"use server";

import { fetchMutation } from "convex/nextjs";
import { SignatureService } from "../../convex/services/signatureService";
import { AddClassArgs } from "../../convex/types";
import { api } from "../../convex/_generated/api";
import { auth } from "@clerk/nextjs/server";

type ClassTime = AddClassArgs["classTimes"][0];
function checkForOverlap(classTimes: ClassTime[]) {
  const days: { [k in ClassTime["day"]]?: [string, string][] } = {};
  for (const classTime of classTimes) {
    if (!days[classTime.day]) {
      days[classTime.day] = [];
    }
    days[classTime.day]!.push([classTime.start, classTime.end]);
  }

  for (const times of Object.values(days)) {
    // loop through each pair of times
    // and compare them with the other pairs
    for (let i = 0; i < times.length - 1; i++) {
      for (let k = i + 1; k < times.length; k++) {
        const [start1, end1] = times[i];
        const [start2, end2] = times[k];

        // formats are like "09:00" and "10:00"
        const nStart1 = parseInt(start1.replace(":", ""));
        const nStart2 = parseInt(start2.replace(":", ""));
        const nEnd1 = parseInt(end1.replace(":", ""));
        const nEnd2 = parseInt(end2.replace(":", ""));

        if (nStart1 >= nEnd1 || nStart2 >= nEnd2) {
          throw new Error("Class ends in the past???");
        }

        if (
          nStart1 === nStart2 ||
          nEnd1 === nEnd2 ||
          (nStart1 > nStart2 && nEnd2 > nStart1) ||
          (nStart2 > nStart1 && nEnd1 > nStart2)
        ) {
          return true;
        }
      }
    }
  }

  return false;
}

export async function addClass(
  formData: FormData,
  classTimes: AddClassArgs["classTimes"],
): Promise<string | null> {
  const { userId } = await auth();

  const title = formData.get("class-title")!.toString();
  const code = formData.get("class-code")!.toString();
  const professor = formData.get("class-prof")!.toString();
  const semester = formData.get("class-semester")!.toString();
  const year = formData.get("class-year")!.toString();
  const credits = formData.get("class-credits")!.toString();
  const targetGrade = formData.get("class-target-grade")!.toString();

  if (!["Summer", "Fall", "Winter"].includes(semester)) {
    return "Invalid semester";
  }

  try {
    if (checkForOverlap(classTimes)) {
      return "Class times overlap";
    }
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
    return "Error while checking for class times overlap";
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
