"use client";

import { Doc, Id } from "@convex/_generated/dataModel";
import { UserCardInfo } from "@convex/types";
import ClubMemberCard from "./ClubMemberCard";

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
  const members = props.members?.toSorted((a, b) =>
    a.userInfo.firstName.localeCompare(b.userInfo.firstName),
  );

  return members && members.length > 0 ? (
    <div className="flex flex-col gap-2 p-2">
      {members.map((member) => (
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
      ))}
    </div>
  ) : null;
}
