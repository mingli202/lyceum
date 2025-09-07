import { Button } from "@/components";
import { RecordValues } from "@/types";
import { useState } from "react";

const Tab = {
  Posts: "Posts",
  Events: "Events",
  Chat: "Chat",
  Members: "Members",
};
type Tab = RecordValues<typeof Tab>;

type ClubTabsProps = {};

export default function ClubTabs() {
  const [selectedTab, setSelectedTab] = useState<Tab>(Tab.Posts);

  const tabMap: Record<Tab, React.ReactNode> = {};
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
