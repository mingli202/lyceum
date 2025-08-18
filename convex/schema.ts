import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    password: v.string(), // hashed
    salt: v.string(),
  }).index("by_email", ["email"]),

  profiles: defineTable({
    userId: v.id("users"),
    displayName: v.string(),
    username: v.string(),
    birthday: v.string(),
    bio: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    city: v.optional(v.string()),
    following: v.array(v.id("users")),
    followers: v.array(v.id("users")),
    school: v.string(),
    academicYear: v.number(),
    major: v.string(),
  }).index("by_userId", ["userId"]),

  settings: defineTable({
    userId: v.id("users"),
    phoneNumber: v.optional(v.string()),
    gradeDisplayFormat: v.union(v.literal("Percentage"), v.literal("GPA")),
    private: v.boolean(),
  }).index("by_userId", ["userId"]),

  posts: defineTable({
    authorId: v.id("users"),
    description: v.string(),
    likes: v.array(v.id("users")),
    comments: v.id("comments"),
    imageUrl: v.string(),
  }).index("by_authorId", ["authorId"]),

  comments: defineTable({
    postId: v.union(v.id("posts"), v.null()),
    authorId: v.id("users"),
    content: v.string(),
    replies: v.array(v.id("replies")),
  }).index("by_postId", ["postId"]),

  replies: defineTable({
    commentId: v.id("comments"),
    postId: v.id("posts"),
    authorId: v.id("users"),
    text: v.string(),
  }).index("by_commentId", ["commentId"]),
});
