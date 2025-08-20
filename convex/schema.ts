import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    password: v.string(), // hashed
    salt: v.string(),
    privileges: v.array(v.string()),
  }).index("by_email", ["email"]),

  profiles: defineTable({
    userId: v.id("users"),
    following: v.array(v.id("users")),
    followers: v.array(v.id("users")),
    clubs: v.array(v.id("clubs")),
    chats: v.array(v.id("chats")),

    birthday: v.string(),
    displayName: v.string(),
    major: v.string(),
    school: v.string(),
    username: v.string(),
    bio: v.optional(v.string()),
    city: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
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
    club: v.union(
      v.object({
        id: v.id("clubs"),
        private: v.boolean(),
      }),
      v.null(),
    ),

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

  events: defineTable({
    userId: v.id("users"),

    date: v.string(),
    description: v.string(),
    location: v.string(),
    title: v.string(),
  }).index("by_userId", ["userId"]),

  clubs: defineTable({
    events: v.array(v.id("events")),
    followers: v.array(v.id("users")),
    members: v.array(v.id("users")),
    posts: v.array(v.id("posts")),

    name: v.string(),
    description: v.string(),
    imageUrl: v.optional(v.string()),
    alloweMemberPost: v.boolean(),
    private: v.boolean(),
    category: v.union(
      v.literal("Academic"),
      v.literal("Social"),
      v.literal("Sports"),
      v.literal("Cultural"),
      v.literal("Recreational"),
      v.literal("Arts"),
      v.literal("Volunteer"),
      v.literal("Other"),
    ),
  }),

  chats: defineTable({
    title: v.string(),
    members: v.array(v.id("users")),
  }),

  messages: defineTable({
    chatId: v.id("chats"),
    senderId: v.id("users"),

    content: v.string(),
  }).index("by_chatId_senderId", ["chatId", "senderId"]),
});
