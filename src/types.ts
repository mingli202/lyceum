import { Doc } from "../convex/_generated/dataModel";

export type User = Doc<"users">;
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

export type Credentials = {
  email: string;
  password: string;
};
