import { Button, ClassCard, PostCard } from "@/components";
import { RecordValues } from "@/types";
import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { BookOpen, Grid2x2, Users } from "lucide-react";
import { useState } from "react";

const Tab = {
  Posts: "Posts",
  Classes: "Classes",
  Clubs: "Clubs",
} as const;

type Tab = RecordValues<typeof Tab>;

export default function UserActivity() {
  const posts = useQuery(api.queries.getUserPosts, {});
  const classes = useQuery(api.queries.getUserClasses, {});
  // const clubs = useQuery(api.queries.getUserClubs, {});

  const [selectedTab, setSelectedTab] = useState<Tab>(Tab.Posts);

  const iconMap: Record<Tab, React.ReactNode> = {
    [Tab.Posts]: <Grid2x2 className="h-4 w-4" />,
    [Tab.Classes]: <BookOpen className="h-4 w-4" />,
    [Tab.Clubs]: <Users className="h-4 w-4" />,
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
      {selectedTab === "Posts" && (
        <div className="flex w-full flex-col gap-2">
          {posts?.map((post) => (
            <PostCard post={post} key={post.postId} />
          ))}
        </div>
      )}
      {selectedTab === "Classes" && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-2">
          {classes?.map((classinfo) => (
            <ClassCard classInfo={classinfo} key={classinfo.classId} />
          ))}

          <div className="col-span-full h-0" />
        </div>
      )}
    </div>
  );
}
