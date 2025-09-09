"use client";

import { api } from "@convex/_generated/api";
import { usePaginatedQuery } from "convex/react";
import { useCallback, useEffect, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import { PostCard } from "../card";
import { NewPost } from "./NewPost";
import { Footer } from "./Footer";
import { Id } from "@convex/_generated/dataModel";

type FeedProps = {
  customScrollParent?: HTMLElement;
  clubId?: Id<"clubs">;
  allowed?: boolean;
};

export function Feed({ customScrollParent, clubId, allowed }: FeedProps) {
  const [now, setNow] = useState(Date.now());
  const [scrollParent, setScrollParent] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!customScrollParent) {
      return;
    }
    setScrollParent(customScrollParent);
  }, [customScrollParent]);

  const {
    results: posts,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.queries.getFeedData,
    { now, clubId },
    { initialNumItems: 10 },
  );

  const refreshFeed = useCallback(() => setNow(Date.now()), []);

  const loadMoreCb = useCallback(() => {
    if (status === "CanLoadMore") {
      loadMore(5);
    }
  }, [loadMore, status]);

  return (
    <Virtuoso
      data={posts}
      endReached={loadMoreCb}
      increaseViewportBy={200}
      context={{
        status,
        loadMore: loadMoreCb,
        refreshFeed,
        clubId,
        allowed,
      }}
      className="h-full"
      itemContent={(_, post) => (
        <PostCard post={post} className="p-1" isClub={clubId !== undefined} />
      )}
      components={{ Header: NewPost, Footer }}
      customScrollParent={scrollParent ?? undefined}
    />
  );
}
