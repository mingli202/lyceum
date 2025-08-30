"use client";

import { useQuery } from "convex/react";
import NewPost from "./NewPost";
import { api } from "@convex/_generated/api";
import { PostCard } from "@/components";
import { useRef } from "react";
import { UserOrClubPost } from "@convex/types";

export default function FeedPage() {
  return (
    <section className="flex h-full w-full justify-center overflow-x-hidden overflow-y-auto">
      <div className="flex h-fit w-full max-w-2xl flex-col gap-4 py-6">
        <NewPost />
        <Feed />
      </div>
    </section>
  );
}

function Feed() {
  const posts = useQuery(api.queries.getFeedData, {});

  return posts && posts.length > 0 ? <FeedList posts={posts} /> : null;
}

function FeedList({ posts }: { posts: UserOrClubPost[] }) {
  // don't update feed if new data comes in
  const postsRef = useRef<UserOrClubPost[]>(posts);

  return (
    <div className="flex w-full flex-col gap-2">
      {postsRef.current.map((post) => (
        <PostCard post={post} key={post.post.postId} />
      ))}
    </div>
  );
}
