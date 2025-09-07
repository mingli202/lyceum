"use client";

import { Doc, Id } from "@convex/_generated/dataModel";
import { UserCardInfo } from "@convex/types";
import ClubMemberCard from "./ClubMemberCard";
import { Virtuoso } from "react-virtuoso";
import { useRef } from "react";

type EditClubMembersTabProps = {
  members?: {
    userInfo: UserCardInfo;
    status: Doc<"userClubsInfo">["status"];
  }[];
  currentUserMemberInfo?: {
    userStatus: Doc<"userClubsInfo">["status"];
    userId: Id<"users">;
  };
  clubId: Id<"clubs">;
};

export default function EditClubMembersTab(props: EditClubMembersTabProps) {
  const containerRef = useRef<HTMLDivElement>(null!);

  const members = props.members ?? [];

  const _placeholders = Array.from({ length: 100 }).map((_, i) => ({
    userInfo: {
      userId: `placeholder-${i}` as Id<"users">,
      firstName: `placeholder-firstName-${i}`,
      username: `placeholder-userName-${i}`,
    },
    status: "member" as Doc<"userClubsInfo">["status"],
  }));

  members.push(..._placeholders);

  return (
    <Virtuoso
      data={members}
      itemContent={(_, member) => (
        <div className="w-full p-1">
          <ClubMemberCard
            member={member}
            currentUserMemberInfo={props.currentUserMemberInfo}
            clubId={props.clubId}
            key={member.userInfo.userId}
            members={members
              .filter(
                (member) =>
                  member.userInfo.userId !==
                    props.currentUserMemberInfo?.userId &&
                  member.status === "member",
              )
              .map((member) => member.userInfo)}
          />
        </div>
      )}
      customScrollParent={containerRef.current}
      computeItemKey={(_, member) => member.userInfo.userId}
      className="h-screen"
    />
  );
}
