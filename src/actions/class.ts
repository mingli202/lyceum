"use server";

import { fetchMutation } from "convex/nextjs";
import { SignatureService } from "@convex/services/signatureService";
import { AddClassArgs } from "@convex/types";
import { api } from "@convex/_generated/api";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { ParsedFileResponse } from "@/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const signatureService = new SignatureService();

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

  const signature = await signatureService.sign({
    ...body,
    clerkId: userId,
  });

  return await fetchMutation(api.mutations.addClass, {
    ...body,
    signature,
  }).catch(() => "Couldn't add class");
}

export async function addClassFromSyllabus(file: File) {
  const res = await openai.files.create({
    file,
    purpose: "user_data",
    expires_after: {
      anchor: "created_at",
      seconds: 3600,
    },
  });

  const response = await openai.responses.parse({
    model: "gpt-5-mini-2025-08-07",
    reasoning: { summary: null, effort: "medium" },
    instructions: "Extract from the course syllabus accurately",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: "Read the parsed data from a syllabus and extract the following data: the course title, the course code that is a unique identifier of the course within the university, the course professor, the semester the course is taken in, how many credits the course is worth, the graded tasks such as assignments and evaluations given in the course, and the class times.",
          },
          { type: "input_file", file_id: res.id },
        ],
      },
    ],
    text: {
      verbosity: "low",
      format: {
        type: "json_schema",
        name: "course_details",
        schema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description:
                "Extract the title of the course in the syllabus exactly as written.",
            },
            code: {
              type: "string",
              description:
                "Extract the unique identifier of the course within the university exactly as written.",
            },
            professor: {
              type: "string",
              description:
                "Extract the professor/instructor/teacher name of the course exactly as written. If there are no professor, default to 'TBT'",
            },
            semester: {
              type: "string",
              description:
                "Exact The semester the course is taken in exactly as written.",
              enum: ["Summer", "Fall", "Winter"],
            },
            credits: {
              type: "number",
              description:
                "Extract the number of credits the course is worth exactly as written. If there are no credits, default to 'TBT'",
            },
            tasks: {
              type: "array",
              description:
                "Extract ALL the tasks graded or not with their exact titles and weights.",
              items: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description:
                      "Extract the name of the task exactly as written.",
                  },
                  dueDate: {
                    type: "string",
                    description:
                      "Extract the due date of the task exactly as written if possible. If there are no due date, default to 'TBT'",
                    format: "date",
                  },
                  weight: {
                    type: "number",
                    description:
                      "Extract the percentage weight of the task exactly as written if possible. If there are no weight, default to 'TBT'",
                  },
                  desc: {
                    type: "string",
                    description:
                      "Extract the description of the task if possible. If there are no description, return an empty string.",
                  },
                },
                required: ["name", "dueDate", "weight", "desc"],
                additionalProperties: false,
              },
            },
            classTimes: {
              type: "array",
              description:
                "Extract ALL the class times of the course exactly as written. Included ALL lectures and laboratories if there are, AND any additional times like tutorials and office hours. If you are unable to find them, return and empty array.",
              items: {
                type: "object",
                properties: {
                  day: {
                    type: "string",
                    description: "The day of the class.",
                    enum: [
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ],
                  },
                  start: {
                    type: "string",
                    description:
                      "The start time of the class exactly as written.",
                    format: "time",
                  },
                  end: {
                    type: "string",
                    description:
                      "The end time of the class exactly as written.",
                    format: "time",
                  },
                },
                required: ["day", "start", "end"],
                additionalProperties: false,
              },
            },
          },
          required: [
            "title",
            "code",
            "professor",
            "semester",
            "credits",
            "tasks",
            "classTimes",
          ],
          additionalProperties: false,
        },
        strict: true,
      },
    },
  });

  const data = ParsedFileResponse.parse(response.output_parsed);

  const classTimes = data.classTimes;

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

  const tasks = data.tasks;

  const { userId } = await auth();
  const body: AddClassArgs = {
    code: data.code,
    title: data.title,
    professor: data.professor,
    semester: data.semester,
    year: new Date().getFullYear(),
    credits: data.credits,
    classTimes,
    targetGrade: 85,
    tasks,
  };

  const signature = await signatureService
    .sign({
      ...body,
      clerkId: userId,
    })
    .catch(() => null);

  if (!signature) {
    return "Something went wrong, please try again";
  }

  return await fetchMutation(api.mutations.addClass, {
    ...body,
    signature,
  }).catch(() => "Couldn't add class");
}
