"use client";

import { Doc, Id } from "@convex/_generated/dataModel";
import { UserCardInfo } from "@convex/types";
import { ClubMemberCard, TransferOwnershipDialog } from "..";
import { Virtuoso } from "react-virtuoso";
import { useRef, useState } from "react";

type ClubMembers = {
  members?: {
    userInfo: UserCardInfo;
    status: Doc<"userClubsInfo">["status"];
  }[];
  currentUserMemberInfo?: {
    userStatus: Doc<"userClubsInfo">["status"];
    userId: Id<"users">;
  };
  clubId: Id<"clubs">;
  editable?: boolean;
};

export function ClubMembers(props: ClubMembers) {
  const containerRef = useRef<HTMLDivElement>(null!);
  const [tranferOwnershipDialogOpen, setTranferOwnershipDialogOpen] =
    useState(false);

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
    <>
      <Virtuoso
        data={members}
        itemContent={(_, member) => (
          <div className="w-full p-1">
            <ClubMemberCard
              member={member}
              editable={props.editable}
              currentUserMemberInfo={props.currentUserMemberInfo}
              clubId={props.clubId}
              key={member.userInfo.userId}
              setTransferOwnershipDialogOpen={setTranferOwnershipDialogOpen}
            />
          </div>
        )}
        customScrollParent={containerRef.current}
        computeItemKey={(_, member) => member.userInfo.userId}
        className="h-screen"
      />
      <TransferOwnershipDialog
        members={members
          .filter(
            (member) =>
              member.userInfo.userId !== props.currentUserMemberInfo?.userId &&
              member.status === "member",
          )
          .map((member) => member.userInfo)}
        clubId={props.clubId}
        open={tranferOwnershipDialogOpen}
        setOpen={setTranferOwnershipDialogOpen}
      />
    </>
  );
}
