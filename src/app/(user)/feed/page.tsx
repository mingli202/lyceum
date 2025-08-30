"use client";

import { useQuery } from "convex/react";
import NewPost from "./NewPost";
import { api } from "@convex/_generated/api";
import { PostCard } from "@/components";
import { useRef } from "react";
import { UserOrClubPost } from "@convex/types";

export default function FeedPage() {
  const posts = useQuery(api.queries.getFeedData, {});

  return (
    <section className="flex h-full w-full justify-center overflow-x-hidden overflow-y-auto">
      <div className="flex h-fit w-full max-w-2xl flex-col gap-4 py-6">
        <NewPost />
        {posts && <Feed posts={posts} />}
      </div>
    </section>
  );
}

function Feed({ posts }: { posts: UserOrClubPost[] }) {
  const currentPosts = useRef(posts);

  return currentPosts.current.length > 0 ? (
    <FeedList posts={currentPosts.current} />
  ) : null;
}

function FeedList({ posts }: { posts: UserOrClubPost[] }) {
  return (
    <div className="flex w-full flex-col gap-2">
      {posts.map((post) => (
        <PostCard post={post} key={post.post.postId} />
      ))}
    </div>
  );
}
