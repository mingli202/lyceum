import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  appState: defineTable({
    state: v.union(
      v.literal("active"),
      v.literal("updating"),
      v.literal("down"),
    ),
  }),

  bannedUsers: defineTable({
    email: v.string(),
  }).index("by_email", ["email"]),

  users: defineTable({
    clerkId: v.string(),
    givenName: v.string(),
    familyName: v.optional(v.string()),
    pictureUrl: v.optional(v.string()),
    email: v.string(),
    username: v.string(),
    state: v.union(
      v.literal("active"),
      v.literal("banned"),
      v.literal("suspended"),
    ),
  }).index("by_clerkId", ["clerkId"]),

  classes: defineTable({
    code: v.string(),

    chatId: v.id("chats"),

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
  }).index("by_school_code", ["school", "code"]),

  profiles: defineTable({
    userId: v.id("users"),

    major: v.string(),
    school: v.string(),
    bio: v.optional(v.string()),
    city: v.optional(v.string()),
    academicYear: v.number(),
    isPrivate: v.boolean(),
    lastSeenAt: v.optional(v.number()),
    bannerId: v.optional(v.id("_storage")),
  }).index("by_userId", ["userId"]),

  settings: defineTable({
    userId: v.id("users"),

    phoneNumber: v.optional(v.string()),
    gradeDisplayFormat: v.union(v.literal("Percentage"), v.literal("GPA")),
  }).index("by_userId", ["userId"]),

  posts: defineTable({
    likes: v.record(v.id("users"), v.boolean()),

    description: v.string(),
    imageId: v.optional(v.id("_storage")),
  }),

  viewablePosts: defineTable({
    userId: v.id("users"),
    postId: v.id("posts"),
    authorId: v.union(v.id("users"), v.id("clubs")),
  })
    .index("by_userId", ["userId"])
    .index("by_postId", ["postId"])
    .index("by_authorId", ["authorId"])
    .index("by_userId_authorId", ["userId", "authorId"])
    .index("by_userId_postId", ["userId", "postId"]),

  clubPosts: defineTable({
    clubId: v.id("clubs"),
    postId: v.id("posts"),
    authorId: v.id("users"),
    isMembersOnly: v.boolean(),
  })
    .index("by_clubId", ["clubId"])
    .index("by_postId", ["postId"]),

  comments: defineTable({
    authorId: v.id("users"),
    postId: v.union(v.id("posts"), v.null()),
    likes: v.record(v.id("users"), v.boolean()),

    text: v.string(),
  }).index("by_postId", ["postId"]),

  replies: defineTable({
    authorId: v.id("users"),
    commentId: v.id("comments"),
    postId: v.id("posts"),
    likes: v.array(v.id("users")),

    text: v.string(),
  })
    .index("by_commentId", ["commentId"])
    .index("by_postId", ["postId"]),

  notifications: defineTable({
    userId: v.id("users"),
    content: v.union(
      v.object({
        type: v.literal("follow"),
        followerId: v.id("users"),
      }),
      v.object({
        type: v.literal("requestFollow"),
        requestFollowerId: v.id("users"),
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
    timestamp: v.string(),
  }).index("by_userId", ["userId"]),

  events: defineTable({
    clubId: v.id("clubs"),

    date: v.string(),
    description: v.string(),
    location: v.string(),
    title: v.string(),
  }).index("by_clubId", ["clubId"]),

  clubs: defineTable({
    chatId: v.id("chats"),
    bannerId: v.optional(v.id("_storage")),
    pictureId: v.optional(v.id("_storage")),

    name: v.string(),
    description: v.string(),
    allowMemberPost: v.boolean(),
    isPrivate: v.boolean(),
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
  }),

  messages: defineTable({
    chatId: v.id("chats"),
    senderId: v.id("users"),

    content: v.string(),
  })
    .index("by_chatId", ["chatId"])
    .index("by_senderId", ["senderId"])
    .index("by_chatId_senderId", ["chatId", "senderId"]),

  followingsInfo: defineTable({
    userId: v.id("users"),
    followingId: v.id("users"),
    status: v.union(
      v.literal("requested"),
      v.literal("accepted"),
      v.literal("blocked"),
      v.literal("unfollowed"), // to prevent constantly deleting
    ),
    cleanupId: v.optional(v.id("_scheduled_functions")),
  })
    .index("by_userId", ["userId"])
    .index("by_followingId", ["followingId"])
    .index("by_userId_followingId", ["userId", "followingId"]),

  userClassInfo: defineTable({
    userId: v.id("users"),
    classId: v.id("classes"),
    targetGrade: v.number(),
  })
    .index("by_userId", ["userId"]) // for getting all the user's classes
    .index("by_classId", ["classId"]) // for getting all users of a class
    .index("by_userId_classId", ["userId", "classId"]), // for checking if a user is a student of a class

  userPosts: defineTable({
    userId: v.id("users"),
    postId: v.id("posts"),
  })
    .index("by_userId", ["userId"])
    .index("by_postId", ["postId"]),

  userTasks: defineTable({
    userId: v.id("users"),
    classId: v.id("classes"),
    userClassInfo: v.id("userClassInfo"),

    description: v.string(),
    dueDate: v.string(),
    name: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("new"),
      v.literal("dropped"),
      v.literal("on hold"),
    ),
    scoreObtained: v.number(),
    scoreTotal: v.number(),
    weight: v.number(),
    type: v.optional(
      v.union(
        v.literal("Exam"),
        v.literal("Assignment"),
        v.literal("Project"),
        v.literal("Quiz"),
        v.literal("Other"),
        v.literal("None"),
      ),
    ),
  })
    .index("by_userId", ["userId"]) // for getting all the user's classes
    .index("by_classId", ["classId"]) // for getting all tasks of a class
    .index("by_userId_classId", ["userId", "classId"]),

  userClubsInfo: defineTable({
    userId: v.id("users"),
    clubId: v.id("clubs"),
    status: v.union(
      v.literal("member"),
      v.literal("following"),
      v.literal("admin"),
      v.literal("banned"),
      v.literal("requested"),
    ),
  })
    .index("by_userId", ["userId"])
    .index("by_clubId", ["clubId"])
    .index("by_userId_clubId", ["userId", "clubId"]),

  userChatsInfo: defineTable({
    userId: v.id("users"),
    chatId: v.id("chats"),
    lastSeenMessage: v.id("messages"),
  })
    .index("by_userId", ["userId"])
    .index("by_chatId", ["chatId"])
    .index("by_userId_chatId", ["userId", "chatId"]),
});
