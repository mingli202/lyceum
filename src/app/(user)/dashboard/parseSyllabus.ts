"use server";

import { AddClassArgs } from "@convex/types";
import OpenAI from "openai";
import { ParsedFileResponse } from "@/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function parseSyllabus(file: File): Promise<AddClassArgs> {
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
    reasoning: { summary: null, effort: "low" },
    instructions: "Extract from the course syllabus accurately",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `Read the parsed data from a syllabus and extract the following data: the school name, the course title, the course code that is a unique identifier of the course within the school, the course professor, the semester and the year the course is taken in, how many credits the course is worth, the graded tasks such as assignments and evaluations given in the course, and the class times. The current date right now is ${new Date().toLocaleString()}, use this to as reference when extracting dates.`,
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
                "Exact The semester the course is taken in exactly as written. Look at the due dates of the assignments and evaluations to accurately determine the semester. For example, if the dates in September to December, it's the Fall semester; in December to May, it's the Winter semester; and in May to September, it's the Summer semester",
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
                      "Extract the due date of the task exactly as written. The due date should take into account the year the course is taken in exactly as written. If the year is not written, then default to the current year.",
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
            school: {
              type: "string",
              description: "Extract the name of the school exactly as written.",
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
            "school",
          ],
          additionalProperties: false,
        },
        strict: true,
      },
    },
  });

  const data = ParsedFileResponse.parse(response.output_parsed);

  const classTimes = data.classTimes;
  const tasks = data.tasks;

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
    school: data.school,
  };
  return body;
}
