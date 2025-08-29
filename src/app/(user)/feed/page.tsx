"use client";

import { useQuery } from "convex/react";
import NewPost from "./NewPost";
import { api } from "@convex/_generated/api";
import { PostCard } from "@/components";

export default function FeedPage() {
  return (
    <section className="flex h-full w-full justify-center overflow-x-hidden overflow-y-auto p-6">
      <div className="flex h-fit w-full max-w-2xl flex-col gap-4">
        <NewPost />
        <Feed />
      </div>
    </section>
  );
}

function Feed() {
  const posts = useQuery(api.queries.getFeedData, {});

  return posts && posts.length > 0 ? (
    <div className="flex w-full flex-col gap-2">
      {posts.map((post) => (
        <PostCard post={post} key={post.post.postId} />
      ))}
    </div>
  ) : null;
}
