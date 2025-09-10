"use client";

import { Feed } from "@/components";
import { useRef } from "react";

export default function FeedPage() {
  const containerRef = useRef<HTMLDivElement>(null!);

  return (
    <div
      className="flex h-screen w-full flex-col justify-center py-4"
      ref={containerRef}
    >
      <Feed customScrollParent={containerRef.current} allowed />
    </div>
  );
}
