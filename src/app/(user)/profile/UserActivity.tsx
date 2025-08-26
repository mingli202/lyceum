"use client";

import { Button, ClassCard, PostCard } from "@/components";
import { ClubCard } from "@/components/ClubCard";
import { RecordValues } from "@/types";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { PostPreviewInfo } from "@convex/types";
import { useQuery } from "convex/react";
import { BookOpen, Grid2x2, Grid3x3, Volleyball } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const Tab = {
  Posts: "Posts",
  Classes: "Classes",
  Clubs: "Clubs",
} as const;

type Tab = RecordValues<typeof Tab>;

export default function UserActivity() {
  // const posts: PostPreviewInfo[] | undefined = useQuery(
  //   api.queries.getUserPosts,
  //   {},
  // );
  const classes = useQuery(api.queries.getUserClasses, {});
  const clubs = useQuery(api.queries.getUserClubs, {});

  const postsPlaceholder: PostPreviewInfo[] = Array(0)
    .fill(0)
    .map((_, i) => ({
      postId: `placeholder-${i}` as Id<"posts">,
      author: {
        authorId: "placeholder" as Id<"users">,
        firstName: "placeholder",
        username: "placeholder",
      },
      nComments: 0,
      nReplies: 0,
      nLikes: 0,
      createdAt: Date.now(),
      clubInfo: null,
      description: "placeholder",
    }));

  const [selectedTab, setSelectedTab] = useState<Tab>(Tab.Posts);

  const iconMap: Record<Tab, React.ReactNode> = {
    [Tab.Posts]: <Grid2x2 className="h-4 w-4" />,
    [Tab.Classes]: <BookOpen className="h-4 w-4" />,
    [Tab.Clubs]: <Volleyball className="h-4 w-4" />,
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="bg-background flex gap-2 rounded-[calc(0.25rem+0.25rem)] p-1 shadow-sm">
        {(["Posts", "Classes", "Clubs"] as const).map((tab) => (
          <Button
            variant={selectedTab === tab ? "special" : undefined}
            className="flex w-full items-center justify-center gap-2 p-1"
            key={tab}
            onClick={() => setSelectedTab(tab)}
          >
            {iconMap[tab]}
            <p className="hidden sm:block">{tab}</p>
          </Button>
        ))}
      </div>
      {selectedTab === "Posts" &&
        (postsPlaceholder && postsPlaceholder.length > 0 ? (
          <div className="flex w-full flex-col gap-2">
            {postsPlaceholder.map((post) => (
              <PostCard post={post} key={post.postId} />
            ))}
          </div>
        ) : (
          <div className="flex w-full flex-col items-center justify-center p-6">
            <Grid3x3 className="text-muted-foreground h-20 w-20 stroke-1" />
            <p>
              Add a post in{" "}
              <Link
                href="/feed"
                className="text-blue-600 underline hover:cursor-pointer"
              >
                feed
              </Link>{" "}
              to get started!
            </p>
          </div>
        ))}
      {selectedTab === "Clubs" &&
        (clubs && clubs.length > 0 ? (
          <div className="flex w-full flex-col gap-2">
            {clubs?.map((club) => (
              <ClubCard club={club} key={club.clubId} />
            ))}
          </div>
        ) : (
          <div className="flex w-full flex-col items-center justify-center p-6">
            <Volleyball className="text-muted-foreground h-20 w-20 stroke-1" />
            <p>
              Add a club in{" "}
              <Link
                href="/clubs"
                className="text-blue-600 underline hover:cursor-pointer"
              >
                clubs
              </Link>{" "}
              to get started!
            </p>
          </div>
        ))}
      {selectedTab === "Classes" &&
        (classes && classes.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-2">
            {classes?.map((classinfo) => (
              <ClassCard classInfo={classinfo} key={classinfo.classId} />
            ))}

            <div className="col-span-full h-0" />
          </div>
        ) : (
          <div className="flex w-full flex-col items-center justify-center p-6">
            <BookOpen className="text-muted-foreground h-20 w-20 stroke-1" />
            <p>
              Add a class in{" "}
              <Link
                href="/dashboard"
                className="text-blue-600 underline hover:cursor-pointer"
              >
                dashboard
              </Link>{" "}
              to get started!
            </p>
          </div>
        ))}
    </div>
  );
}
