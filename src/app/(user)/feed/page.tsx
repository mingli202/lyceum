"use client";

import { usePaginatedQuery } from "convex/react";
import NewPost from "./NewPost";
import { api } from "@convex/_generated/api";
import { Button, ButtonVariant, PostCard } from "@/components";
import { createContext, useCallback, useState } from "react";
import { Virtuoso } from "react-virtuoso";

export const PostCardContext = createContext<{
  refreshFeed: () => void;
}>({
  refreshFeed: () => {},
});

function Footer({
  context: { status, loadMore },
}: {
  context: {
    status: "LoadingFirstPage" | "CanLoadMore" | "LoadingMore" | "Exhausted";
    loadMore: () => void;
  };
}) {
  return (
    <div className="flex w-full justify-center p-4">
      <Button
        variant={ButtonVariant.Muted}
        className="ring-0"
        disabled={status !== "CanLoadMore"}
        onClick={() => {
          if (status === "CanLoadMore") {
            loadMore();
          }
        }}
      >
        {status === "CanLoadMore" && "Load More"}
        {status === "LoadingMore" && "Loading..."}
        {status === "LoadingFirstPage" && "Loading..."}
        {status === "Exhausted" && "No more posts"}
      </Button>
    </div>
  );
}

export default function FeedPage() {
  const [now, setNow] = useState(Date.now());

  const {
    results: posts,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.queries.getFeedData,
    { now },
    { initialNumItems: 10 },
  );

  const refreshFeed = useCallback(() => setNow(Date.now()), []);

  const loadMoreCb = useCallback(() => {
    if (status === "CanLoadMore") {
      loadMore(5);
    }
  }, [loadMore, status]);

  return (
    <PostCardContext.Provider value={{ refreshFeed }}>
      <Virtuoso
        data={posts}
        endReached={loadMoreCb}
        increaseViewportBy={200}
        context={{ status, loadMore: loadMoreCb }}
        className="h-full w-full overflow-x-hidden overflow-y-auto"
        itemContent={(_, post) => <PostCard post={post} isFeed />}
        components={{ Header: NewPost, Footer }}
      />
    </PostCardContext.Provider>
  );
}
