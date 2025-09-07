"use client";

import { Button, ButtonVariant, PaddingSize } from "@/components";
import { RecordValues } from "@/types";
import { ClubPageData } from "@convex/types";
import { Settings, Users, X } from "lucide-react";
import { Dialog } from "radix-ui";
import { useRef, useState } from "react";
import EditClubSettingsTab from "./EditClubSettingsTab";
import EditClubMembersTab from "./EditClubMembersTab";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

const Tab = {
  Settings: "Settings",
  Members: "Members",
} as const;

type Tab = RecordValues<typeof Tab>;

export default function EditClubTabs({ data }: { data: ClubPageData }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [selectedTab, setSelectedTab] = useState<Tab>(Tab.Settings);

  const members = useQuery(api.queries.getClubMembers, {
    clubId: data.clubId,
  });

  const iconMap: Record<Tab, React.ReactNode> = {
    [Tab.Settings]: <Settings className="h-4 w-4" />,
    [Tab.Members]: <Users className="h-4 w-4" />,
  };

  const tabMap: Record<Tab, React.ReactNode> = {
    [Tab.Settings]: (
      <EditClubSettingsTab data={data} closeButtonRef={closeButtonRef} />
    ),
    [Tab.Members]: (
      <EditClubMembersTab
        clubId={data.clubId}
        members={members}
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
  };

  return (
    <div className="bg-background ring-foreground/10 relative flex h-[min(calc(28rem*1.5),calc(100vh-2rem))] w-md flex-col gap-2 overflow-hidden rounded-lg p-2 shadow-md ring-1">
      <div className="flex items-center gap-2 px-2 pt-2">
        <Dialog.Close asChild ref={closeButtonRef}>
          <Button
            variant={ButtonVariant.Muted}
            className="ring-0"
            paddingSize={PaddingSize.none}
          >
            <X className="h-4 w-4" />
          </Button>
        </Dialog.Close>
        <Dialog.Title className="font-bold">Manage Club</Dialog.Title>
      </div>

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
