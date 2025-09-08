"use client";

import { Button, Chat, ClubMembers, Feed } from "@/components";
import { RecordValues } from "@/types";
import { api } from "@convex/_generated/api";
import { ClubPageData } from "@convex/types";
import { useQuery } from "convex/react";
import { useState } from "react";

const Tab = {
  Posts: "Posts",
  Events: "Events",
  Chat: "Chat",
  Members: "Members",
};
type Tab = RecordValues<typeof Tab>;

type ClubTabsProps = {
  data: ClubPageData;
  customScrollParent?: HTMLElement;
};

export default function ClubTabs({ data, customScrollParent }: ClubTabsProps) {
  const [selectedTab, setSelectedTab] = useState<Tab>(Tab.Posts);

  const members = useQuery(api.queries.getClubMembers, {
    clubId: data.clubId,
  });

  const tabMap: Record<Tab, React.ReactNode> = {
    [Tab.Members]: (
      <ClubMembers
        members={members}
        clubId={data.clubId}
        customScrollParent={customScrollParent}
        currentUserMemberInfo={
          data.memberInfo
            ? {
                userStatus: data.memberInfo.userStatus,
                userId: data.memberInfo.userId,
              }
            : undefined
        }
      />
    ),
    [Tab.Chat]: data.memberInfo ? (
      <Chat chatId={data.memberInfo.chatId} className="h-[calc(100vh-10rem)]" />
    ) : null,
    [Tab.Posts]: (
      <Feed clubId={data.clubId} customScrollParent={customScrollParent} />
    ),
  };
  const iconMap: Record<Tab, React.ReactNode> = {};

  return (
    <div className="flex w-full flex-col gap-2 pt-4">
      <div className="bg-background flex gap-2 rounded-[calc(0.25rem+0.25rem)] p-1 shadow-sm">
        {Object.values(Tab).map((tab) => (
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
      {tabMap[selectedTab]}
    </div>
  );
}
