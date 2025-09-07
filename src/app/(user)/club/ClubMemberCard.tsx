"use client";

import {
  Button,
  ButtonVariant,
  Card,
  PaddingSize,
  ProfilePicture,
} from "@/components";
import { cn } from "@/utils/cn";
import { api } from "@convex/_generated/api";
import { Doc, Id } from "@convex/_generated/dataModel";
import { UserCardInfo } from "@convex/types";
import { useMutation } from "convex/react";
import {
  Ban,
  CheckCircle,
  EllipsisVertical,
  LogOut,
  MessageCircle,
  XCircle,
} from "lucide-react";
import { DropdownMenu } from "radix-ui";
import Link from "next/link";
import TransferOwnershipDialog from "./TransferOwnershipDialog";

type ClubMemberCardProps = {
  member: {
    userInfo: UserCardInfo;
    status: Doc<"userClubsInfo">["status"];
  };
  currentUserMemberInfo?: {
    userStatus: Doc<"userClubsInfo">["status"];
    userId: Id<"users">;
  };
  clubId: Id<"clubs">;
  members: UserCardInfo[];
};

export default function ClubMemberCard(props: ClubMemberCardProps) {
  const { member } = props;

  return (
    <Card className={cn("flex flex-row items-center justify-between")}>
      <div className="flex items-center gap-2">
        <Link
          href={`/user?id=${member.userInfo.userId}`}
          className="flex h-fit flex-col justify-center"
          target="_blank"
        >
          <ProfilePicture
            src={member.userInfo.pictureUrl}
            displayName={member.userInfo.firstName}
          />
        </Link>
        <div className="flex h-fit flex-col justify-center">
          <div className="flex items-center gap-2">
            <Link
              href={`/user?id=${member.userInfo.userId}`}
              className="truncate font-bold hover:cursor-pointer hover:underline"
              target="_blank"
            >
              {member.userInfo.firstName}
            </Link>

            <p
              className={cn(
                "text-bold rounded-full bg-gradient-to-br px-1 py-0.25 text-xs ring-1",
                {
                  "from-yellow-200 to-red-300 text-orange-700 ring-orange-400":
                    member.status === "member",
                  "from-sky-200 to-violet-300 text-indigo-700 ring-indigo-400":
                    member.status === "admin",
                  "from-green-200 to-teal-300 text-emerald-700 ring-emerald-400":
                    member.status === "following",
                  "bg-slate-200 text-slate-700 ring-slate-400":
                    member.status === "banned",
                },
              )}
            >
              {member.status}
            </p>
          </div>
          <Link
            href={`/user?id=${member.userInfo.userId}`}
            className="text-muted-foreground truncate text-sm hover:cursor-pointer hover:underline"
            target="_blank"
          >
            @{member.userInfo.username}
          </Link>
        </div>
      </div>
      <MemberDropdownMenu
        {...member}
        currentUserMemberInfo={props.currentUserMemberInfo}
        clubId={props.clubId}
        members={props.members}
      />
    </Card>
  );
}

type MemberDropdownMenuProps = {
  userInfo: UserCardInfo;
  status: Doc<"userClubsInfo">["status"];
  clubId: Id<"clubs">;
  currentUserMemberInfo?: {
    userStatus: Doc<"userClubsInfo">["status"];
    userId: Id<"users">;
  };
  members: UserCardInfo[];
};
function MemberDropdownMenu(props: MemberDropdownMenuProps) {
  const leaveClub = useMutation(api.mutations.leaveClub);
  const acceptMemberRequest = useMutation(api.mutations.acceptMemberRequest);

  const isTheMemberTheCurrentUser =
    props.currentUserMemberInfo?.userId === props.userInfo.userId;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          variant={ButtonVariant.Muted}
          paddingSize={PaddingSize.sm}
          className="ring-0"
        >
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="bg-background ring-foreground/10 animate-pop-in z-10 flex flex-col gap-1 rounded-lg p-1 shadow-md ring-1 transition hover:shadow-lg">
        {props.status === "requested" ? (
          <>
            <DropdownMenu.Item asChild>
              <Button
                variant={ButtonVariant.Destructive}
                className="flex w-full items-center gap-2"
                dropdown
                onClick={async () => {
                  await acceptMemberRequest({
                    clubId: props.clubId,
                    userId: props.userInfo.userId,
                    accept: true,
                  });
                }}
              >
                <CheckCircle className="h-4 w-4" />
                Accept
              </Button>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Button
                variant={ButtonVariant.Destructive}
                className="flex w-full items-center gap-2"
                dropdown
                onClick={async () => {
                  await acceptMemberRequest({
                    clubId: props.clubId,
                    userId: props.userInfo.userId,
                    accept: false,
                  });
                }}
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
            </DropdownMenu.Item>
          </>
        ) : (
          <>
            {isTheMemberTheCurrentUser ? (
              <DropdownMenu.Item asChild>
                <TransferOwnershipDialog
                  members={props.members}
                  clubId={props.clubId}
                />
              </DropdownMenu.Item>
            ) : (
              <>
                <DropdownMenu.Item asChild>
                  <Link
                    href={`/chat?userId=${props.userInfo.userId}`}
                    className="w-full"
                  >
                    <Button
                      variant={ButtonVariant.Special}
                      className="flex w-full items-center gap-2"
                      dropdown
                    >
                      <MessageCircle className="h-4 w-4" />
                      Message
                    </Button>
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Button
                    variant={ButtonVariant.Destructive}
                    className="flex w-full items-center gap-2"
                    dropdown
                    onClick={async () => {
                      await leaveClub({
                        clubId: props.clubId,
                        userId: props.userInfo.userId,
                      });
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Kick
                  </Button>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Button
                    variant={ButtonVariant.Destructive}
                    className="flex w-full items-center gap-2"
                    dropdown
                    onClick={async () => {
                      console.log("hello world");

                      await leaveClub({
                        clubId: props.clubId,
                        userId: props.userInfo.userId,
                        isBanningUser: true,
                      });
                    }}
                  >
                    <Ban className="h-4 w-4" />
                    {props.status === "banned" ? "Unban" : "Ban"}
                  </Button>
                </DropdownMenu.Item>
              </>
            )}
          </>
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
