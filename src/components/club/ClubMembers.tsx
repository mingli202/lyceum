"use client";

import { Doc, Id } from "@convex/_generated/dataModel";
import { UserCardInfo } from "@convex/types";
import { ClubMemberCard, TransferOwnershipDialog } from "..";
import { Virtuoso } from "react-virtuoso";
import { CSSProperties, useState } from "react";

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
  useWindowScroll?: boolean;
  customScrollParent?: HTMLElement;
  style?: CSSProperties | undefined;
};

export function ClubMembers({
  members: _members,
  currentUserMemberInfo,
  clubId,
  editable,
  useWindowScroll,
  customScrollParent,
  style,
}: ClubMembers) {
  const [tranferOwnershipDialogOpen, setTranferOwnershipDialogOpen] =
    useState(false);

  const members = _members ?? [];

  const _placeholders = Array.from({ length: 100 }).map((_, i) => ({
    userInfo: {
      userId: `placeholder-${i}` as Id<"users">,
      firstName: `placeholder-firstName-${i}`,
      username: `placeholder-userName-${i}`,
    },
    status: "member" as Doc<"userClubsInfo">["status"],
  }));

  // members.push(..._placeholders);

  return (
    <>
      <Virtuoso
        data={members}
        style={{ height: "100%", ...style }}
        itemContent={(_, member) => (
          <div className="w-full p-1">
            <ClubMemberCard
              member={member}
              editable={editable}
              currentUserMemberInfo={currentUserMemberInfo}
              clubId={clubId}
              key={member.userInfo.userId}
              setTransferOwnershipDialogOpen={setTranferOwnershipDialogOpen}
            />
          </div>
        )}
        computeItemKey={(_, member) => member.userInfo.userId}
        useWindowScroll={useWindowScroll}
        customScrollParent={customScrollParent}
      />
      {editable && (
        <TransferOwnershipDialog
          members={members
            .filter(
              (member) =>
                member.userInfo.userId !== currentUserMemberInfo?.userId &&
                member.status === "member",
            )
            .map((member) => member.userInfo)}
          clubId={clubId}
          open={tranferOwnershipDialogOpen}
          setOpen={setTranferOwnershipDialogOpen}
        />
      )}
    </>
  );
}
