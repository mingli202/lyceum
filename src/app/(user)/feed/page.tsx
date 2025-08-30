"use client";

import { useQuery } from "convex/react";
import NewPost from "./NewPost";
import { api } from "@convex/_generated/api";
import { PostCard } from "@/components";
import { useCallback, useEffect, useRef, useState } from "react";
import { UserOrClubPost } from "@convex/types";

export default function FeedPage() {
  const posts = useQuery(api.queries.getFeedData, {});
  const [currentPosts, setCurrentPosts] = useState(posts);

  const didChange = useRef(true);

  const refreshFeed = useCallback(() => (didChange.current = true), []);

  useEffect(() => {
    if (didChange.current || !currentPosts) {
      setCurrentPosts(posts);
      didChange.current = false;
    }
  }, [posts]);

  return (
    <section className="flex h-full w-full justify-center overflow-x-hidden overflow-y-auto">
      <div className="flex h-fit w-full max-w-2xl flex-col gap-4 py-6">
        <NewPost refreshFeed={refreshFeed} />
        {currentPosts && <Feed posts={currentPosts} />}
      </div>
    </section>
  );
}

function Feed({ posts }: { posts: UserOrClubPost[] }) {
  useEffect(() => {
    console.log(posts);
  }, [posts]);
  return posts.length > 0 ? <FeedList posts={posts} /> : null;
}

function FeedList({ posts }: { posts: UserOrClubPost[] }) {
  return (
    <div className="flex w-full flex-col gap-2">
      {posts.map((post) => (
        <PostCard post={post} key={post.post.postId} isFeed />
      ))}
    </div>
  );
}
