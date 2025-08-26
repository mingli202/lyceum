import z from "zod";

export type RecordValues<T extends Record<string | number | symbol, unknown>> =
  T[keyof T];

export type Credentials = {
  email: string;
  password: string;
};

export const ParsedFileResponse = z.object({
  title: z.string(),
  code: z.string(),
  professor: z.string(),
  semester: z.enum(["Summer", "Fall", "Winter"]),
  school: z.string(),
  credits: z.number(),
  tasks: z.array(
    z.object({
      name: z.string(),
      dueDate: z.string(),
      weight: z.number(),
      desc: z.string(),
    }),
  ),
  classTimes: z.array(
    z.object({
      day: z.enum([
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ]),
      start: z.string(),
      end: z.string(),
    }),
  ),
});

export const TaskStatus = {
  Completed: "completed",
  Active: "active",
  Dropped: "dropped",
  OnHold: "on hold",
  New: "new",
} as const;

export const TaskType = {
  Exam: "Exam",
  Assignments: "Assignments",
  Project: "Project",
  Quiz: "Quiz",
  Other: "Other",
  None: "None",
} as const;

export type TaskStatus = RecordValues<typeof TaskStatus>;
export type TaskType = RecordValues<typeof TaskType>;
export type ParsedFileResponse = z.infer<typeof ParsedFileResponse>;
