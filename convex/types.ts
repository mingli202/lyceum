import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";
import schema from "./schema";

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

export const ClassTime = v.object({
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
  classTimes: v.array(ClassTime),
  targetGrade: v.number(),
  tasks: v.array(
    v.object({
      name: v.string(),
      dueDate: v.string(),
      weight: v.number(),
      desc: v.string(),
      taskType: schema.tables.userTasks.validator.fields.type,
    }),
  ),
  school: v.optional(v.string()),
});

export const CanView = v.object({
  canView: v.boolean(),
  reason: v.union(
    v.literal("Blocked"),
    v.literal("Requested"),
    v.literal("Private account"),
    v.literal("User not found"),
    v.literal("Public account"),
    v.literal("Following"),
    v.literal("Own account"),
  ),
});
export const ProfileData = v.object({
  userId: v.id("users"),
  clerkId: v.string(),
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
  isPrivate: v.boolean(),
  followingStatus: v.optional(
    schema.tables.followingsInfo.validator.fields.status,
  ),
  bannerUrl: v.optional(v.string()),
});

export const UserPostPreviewInfo = v.object({
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
  createdAt: v.number(),
  description: v.string(),
  imageUrl: v.optional(v.string()),
});

export const ClubPostPreviewInfo = v.object({
  postId: v.id("posts"),
  club: v.object({
    clubId: v.id("clubs"),
    pictureUrl: v.optional(v.string()),
    name: v.string(),
  }),
  nComments: v.number(),
  nReplies: v.number(),
  nLikes: v.number(),
  createdAt: v.number(),
  description: v.string(),
  imageUrl: v.optional(v.string()),
  isMembersOnly: v.boolean(),
});

export const ClubUserStatus =
  schema.tables.userClubsInfo.validator.fields.status;

export const ClubCategory = v.union(
  v.literal("Academic"),
  v.literal("Social"),
  v.literal("Sports"),
  v.literal("Cultural"),
  v.literal("Recreational"),
  v.literal("Arts"),
  v.literal("Volunteer"),
  v.literal("Other"),
);

export const ClubPreviewInfo = v.object({
  clubId: v.id("clubs"),
  pictureUrl: v.optional(v.string()),
  name: v.string(),
  category: ClubCategory,
  nMembers: v.number(),
  status: ClubUserStatus,
  description: v.string(),
  isPrivate: v.boolean(),
});

export const ClassPageData = v.object({
  classId: v.id("classes"),
  code: v.string(),
  nClassmates: v.number(),
  grade: v.number(),
  targetGrade: v.number(),
  remainingGrade: v.number(),

  title: v.string(),
  professor: v.string(),
  school: v.string(),
  semester: v.union(
    v.literal("Summer"),
    v.literal("Fall"),
    v.literal("Winter"),
  ),
  year: v.number(),
  credits: v.number(),
  classTimes: v.array(ClassTime),
});

export const UserCardInfo = v.object({
  userId: v.id("users"),
  pictureUrl: v.optional(v.string()),
  firstName: v.string(),
  username: v.string(),
});

export type ClassInfo = typeof ClassInfo.type;
export type DashboardData = typeof DashboardData.type;
export type CreateNewUserArgs = typeof CreateNewUserArgs.type;
export type AddClassArgs = typeof AddClassArgs.type;
export type ClassTime = typeof ClassTime.type;
export type ProfileData = typeof ProfileData.type;
export type UserPostPreviewInfo = typeof UserPostPreviewInfo.type;
export type ClubPreviewInfo = typeof ClubPreviewInfo.type;
export type ClubCategory = typeof ClubCategory.type;
export type ClubUserStatus = typeof ClubUserStatus.type;
export type ClassPageData = typeof ClassPageData.type;
export type UserCardInfo = typeof UserCardInfo.type;
export type CanView = typeof CanView.type;
export type ClubPostPreviewInfo = typeof ClubPostPreviewInfo.type;
