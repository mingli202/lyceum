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
  EllipsisVertical,
  LogOut,
  MessageCircle,
  TriangleAlert,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { DropdownMenu } from "radix-ui";
import Link from "next/link";

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
};

export default function ClubMemberCard(props: ClubMemberCardProps) {
  const { member, currentUserMemberInfo } = props;
  const router = useRouter();

  return (
    <Card
      className={cn(
        "flex flex-row items-center justify-between",
        member.status === "admin" && "-order-1",
        currentUserMemberInfo?.userId === member.userInfo.userId && "-order-2",
      )}
    >
      <div className="flex items-center gap-2">
        <ProfilePicture
          src={member.userInfo.pictureUrl}
          displayName={member.userInfo.firstName}
          onClick={() => router.push(`/user?id=${member.userInfo.userId}`)}
        />
        <div className="flex h-fit flex-col justify-center">
          <div className="flex items-center gap-2">
            <p
              className="truncate font-bold hover:cursor-pointer hover:underline"
              onClick={() => router.push(`/user?id=${member.userInfo.userId}`)}
            >
              {member.userInfo.firstName}
            </p>

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
                },
              )}
            >
              {member.status}
            </p>
          </div>
          <p
            className="text-muted-foreground truncate text-sm hover:cursor-pointer hover:underline"
            onClick={() => router.push(`/user?id=${member.userInfo.userId}`)}
          >
            @{member.userInfo.username}
          </p>
        </div>
      </div>
      <MemberDropdownMenu
        {...member}
        currentUserMemberInfo={props.currentUserMemberInfo}
        clubId={props.clubId}
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
};
function MemberDropdownMenu(props: MemberDropdownMenuProps) {
  const leaveClub = useMutation(api.mutations.leaveClub);

  const isTheMemberTheCurrentUser =
    props.currentUserMemberInfo?.userId === props.userInfo.userId;

  const isTheCurrentUserAdmin =
    props.currentUserMemberInfo?.userStatus === "admin";

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
      <DropdownMenu.Content className="bg-background ring-foreground/10 animate-pop-in flex flex-col gap-1 rounded-lg p-1 shadow-md ring-1 transition hover:shadow-lg">
        {isTheMemberTheCurrentUser ? (
          isTheCurrentUserAdmin ? (
            <DropdownMenu.Item asChild>
              <Button
                variant={ButtonVariant.Destructive}
                className="flex w-full items-center gap-2"
                dropdown
                onClick={async () => {}}
              >
                <TriangleAlert className="h-4 w-4" />
                Transfer Ownership
              </Button>
            </DropdownMenu.Item>
          ) : (
            <DropdownMenu.Item asChild>
              <Button
                variant={ButtonVariant.Destructive}
                className="flex w-full items-center gap-2"
                dropdown
                onClick={async () => {
                  await leaveClub({
                    clubId: props.clubId,
                  });
                }}
              >
                <LogOut className="h-4 w-4" />
                Leave
              </Button>
            </DropdownMenu.Item>
          )
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
            {isTheCurrentUserAdmin && (
              <>
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
                  >
                    <Ban className="h-4 w-4" />
                    Ban
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
