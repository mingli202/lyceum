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

    birthday: v.string(),
    displayName: v.string(),
    major: v.string(),
    school: v.string(),
    username: v.string(),
    bio: v.optional(v.string()),
    city: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    following: v.array(v.id("users")),
    followers: v.array(v.id("users")),
    academicYear: v.number(),
  }).index("by_userId", ["userId"]),

  settings: defineTable({
    userId: v.id("users"),

    phoneNumber: v.optional(v.string()),
    gradeDisplayFormat: v.union(v.literal("Percentage"), v.literal("GPA")),
    private: v.boolean(),
  }).index("by_userId", ["userId"]),

  posts: defineTable({
    authorId: v.id("users"),
    comments: v.id("comments"),
    likes: v.array(v.id("users")),

    description: v.string(),
    imageUrl: v.string(),
  }).index("by_authorId", ["authorId"]),

  comments: defineTable({
    authorId: v.id("users"),
    replies: v.array(v.id("replies")),
    postId: v.union(v.id("posts"), v.null()),

    content: v.string(),
  }).index("by_postId", ["postId"]),

  replies: defineTable({
    authorId: v.id("users"),
    commentId: v.id("comments"),
    postId: v.id("posts"),

    text: v.string(),
  }).index("by_commentId", ["commentId"]),

  notifications: defineTable({
    userId: v.id("users"),
    content: v.union(
      v.object({
        type: v.literal("follow"),
        followerId: v.id("users"),
      }),
      v.object({
        type: v.literal("like"),
        postId: v.id("posts"),
      }),
      v.object({
        type: v.literal("comment"),
        commentId: v.id("comments"),
      }),
      v.object({
        type: v.literal("reply"),
        replyId: v.id("replies"),
      }),
    ),
  }).index("by_userId", ["userId"]),
});
