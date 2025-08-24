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

export const ClassInfo = v.object({
  code: v.string(),
  title: v.string(),
  professor: v.string(),
  classId: v.id("classes"),
  grade: v.number(),
});

export const DashboardData = v.object({
  classesInfo: v.array(ClassInfo),
  average: v.optional(v.number()),
});

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
  tasks: v.array(
    v.object({
      name: v.string(),
      dueDate: v.string(),
      weight: v.number(),
      desc: v.string(),
    }),
  ),
});

export const ProfileData = v.object({
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
  followers: v.array(v.id("users")),
  following: v.array(v.id("users")),
});

export const PostPreviewInfo = v.object({
  postId: v.id("posts"),
  author: v.object({
    authorId: v.id("users"),
    pictureUrl: v.optional(v.string()),
    firstName: v.string(),
    lastName: v.optional(v.string()),
    username: v.string(),
  }),
  nComments: v.number(),
  nReplies: v.number(),
  nLikes: v.number(),
  clubInfo: v.union(
    v.object({
      clubName: v.string(),
      private: v.boolean(),
    }),
    v.null(),
  ),
  createdAt: v.number(),
  description: v.string(),
  imageUrl: v.optional(v.string()),
});

export type ClassInfo = typeof ClassInfo.type;
export type DashboardData = typeof DashboardData.type;
export type CreateNewUserArgs = typeof CreateNewUserArgs.type;
export type AddClassArgs = typeof AddClassArgs.type;
export type ProfileData = typeof ProfileData.type;
export type PostPreviewInfo = typeof PostPreviewInfo.type;
