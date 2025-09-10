"use client";

import { Button, ButtonVariant, Card, PaddingSize } from "@/components";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import { useRef } from "react";
import { ClubMemberCard } from "@/components";

type MemberRequestDialogProps = {
  clubId: Id<"clubs">;
};

export default function MemberRequestDialog(props: MemberRequestDialogProps) {
  const memberRequests = useQuery(api.queries.getClubRequests, {
    clubId: props.clubId,
  });

  const closeButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button
          variant={
            (memberRequests?.length ?? -1 > 0)
              ? ButtonVariant.Special
              : ButtonVariant.Muted
          }
        >
          Requests ({memberRequests?.length})
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="animate-pop-in fixed top-1/2 left-1/2 z-10 h-fit -translate-1/2">
          <div className="bg-background ring-foreground/10 flex w-md flex-col gap-2 rounded-lg p-2 shadow-md ring-1">
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
              <Dialog.Title className="font-bold">Manage Requests</Dialog.Title>
            </div>
            {memberRequests && memberRequests.length > 0 ? (
              <div className="flex flex-col gap-2 p-2">
                {memberRequests.map((member) => (
                  <ClubMemberCard
                    member={{ userInfo: member, status: "requested" }}
                    clubId={props.clubId}
                    key={member.userId}
                    editable
                  />
                ))}
              </div>
            ) : (
              <Card className="w-full text-center">No request</Card>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
