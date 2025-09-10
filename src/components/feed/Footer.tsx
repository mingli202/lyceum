"use client";

import { Button, ButtonVariant } from "../ui";

export function Footer({
  context: { status, loadMore },
}: {
  context: {
    status: "LoadingFirstPage" | "CanLoadMore" | "LoadingMore" | "Exhausted";
    loadMore: () => void;
  };
}) {
  return (
    <div className="flex w-full justify-center">
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
