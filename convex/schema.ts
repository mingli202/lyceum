import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    password: v.string(), // hashed
    salt: v.string(),
  }),

  profiles: defineTable({
    userId: v.id("users"),
    displayName: v.string(),
    username: v.string(),
    birthday: v.string(),
    bio: v.optional(v.string()),
    image: v.optional(v.string()),
    city: v.optional(v.string()),
    following: v.array(v.id("users")),
    followers: v.array(v.id("users")),
    school: v.string(),
    academicYear: v.number(),
    major: v.string(),
  }).index("userId", ["userId"]),

  settings: defineTable({
    userId: v.id("users"),
    phoneNumber: v.optional(v.string()),
    gradeDisplayFormat: v.union(v.literal("Percentage"), v.literal("GPA")),
    private: v.boolean(),
  }).index("userId", ["userId"]),
});
