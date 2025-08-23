import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";

export type User = Doc<"users">;
export type Class = Doc<"classes">;
export type UserTask = Doc<"userTasks">;
export type Profile = Doc<"profiles">;
export type Setting = Doc<"settings">;
export type Post = Doc<"posts">;
export type Comment = Doc<"comments">;
export type Reply = Doc<"replies">;
export type Notification = Doc<"notifications">;
export type Event = Doc<"events">;
export type Club = Doc<"clubs">;
export type Chat = Doc<"chats">;
export type Message = Doc<"messages">;

export const DashboardData = v.object({
  classesInfo: v.array(
    v.object({
      code: v.string(),
      title: v.string(),
      professor: v.string(),
      _id: v.id("classes"),
      grade: v.number(),
    }),
  ),
  average: v.optional(v.number()),
});
export type DashboardData = typeof DashboardData.type;

export const CreateNewUserArgs = v.object({
  signature: v.optional(v.string()),
  school: v.string(),
  major: v.string(),
  firstName: v.string(),
  lastName: v.optional(v.string()),
  username: v.string(),
  academicYear: v.number(),
  city: v.optional(v.string()),
  email: v.string(),
  pictureUrl: v.optional(v.string()),
  bio: v.optional(v.string()),
  clerkId: v.string(),
});
export type CreateNewUserArgs = typeof CreateNewUserArgs.type;

export const AddClassArgs = v.object({
  signature: v.optional(v.string()),
  code: v.string(),
  title: v.string(),
  professor: v.string(),
  semester: v.union(
    v.literal("Summer"),
    v.literal("Fall"),
    v.literal("Winter"),
  ),
  year: v.number(),
  credits: v.number(),
  classTimes: v.array(
    v.object({
      day: v.union(
        v.literal("Monday"),
        v.literal("Tuesday"),
        v.literal("Wednesday"),
        v.literal("Thursday"),
        v.literal("Friday"),
        v.literal("Saturday"),
        v.literal("Sunday"),
      ),
      start: v.string(),
      end: v.string(),
    }),
  ),
  targetGrade: v.number(),
  tasks: v.array(v.id("userTasks")),
});
export type AddClassArgs = typeof AddClassArgs.type;
