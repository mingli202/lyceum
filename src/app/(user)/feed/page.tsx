"use client";

import { usePaginatedQuery } from "convex/react";
import NewPost from "./NewPost";
import { api } from "@convex/_generated/api";
import { PostCard } from "@/components";
import { useCallback, useRef, useState } from "react";

export default function FeedPage() {
  const [now, setNow] = useState(Date.now());
  const [topIndex, setTopIndex] = useState(0);

  const sectionRef = useRef<HTMLDivElement>(null!);

  const {
    results: posts,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.queries.getFeedData,
    { now },
    { initialNumItems: 5 },
  );

  const refreshFeed = useCallback(() => setNow(Date.now()), []);
  const loadMoreCb = useCallback(() => {
    if (status === "CanLoadMore") {
      loadMore(5);
    }
  }, [loadMore, status]);

  return (
    <section
      className="flex h-full w-full justify-center overflow-x-hidden overflow-y-auto"
      ref={sectionRef}
    >
      <div className="flex h-fit w-full max-w-2xl flex-col gap-4 py-6">
        <NewPost refreshFeed={refreshFeed} />
        {posts.length > 0 && (
          <div className="flex w-full flex-col gap-2">
            {posts.map((post, i) => (
              <PostCard
                post={post}
                key={post.post.postId}
                isFeed
                index={i}
                loadmore={loadMoreCb}
                dataLength={posts.length}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
