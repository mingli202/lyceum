import { Button, ButtonVariant } from "@/components";
import { cn } from "@/utils/cn";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { UserCardInfo } from "@convex/types";
import { useMutation } from "convex/react";
import { TriangleAlert } from "lucide-react";
import { AlertDialog } from "radix-ui";
import { useRef, useState } from "react";
import { Virtuoso } from "react-virtuoso";

type TransferOwnershipDialogProps = {
  members: UserCardInfo[];
  clubId: Id<"clubs">;
};

export default function TransferOwnershipDialog(
  props: TransferOwnershipDialogProps,
) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <Button
          variant={ButtonVariant.Destructive}
          className="flex w-full items-center gap-2"
          dropdown
        >
          <TriangleAlert className="h-4 w-4" />
          Transfer Ownership
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <TransferOwnershipDialogContent {...props} />
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

function TransferOwnershipDialogContent(props: TransferOwnershipDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null!);
  const [error, setError] = useState<string>();

  const transferClubOwnership = useMutation(
    api.mutations.transferClubOwnership,
  );

  const [selectedMember, setSelectedMember] = useState<UserCardInfo>();

  const members = props.members;

  return (
    <AlertDialog.Content className="fixed inset-0 z-100 flex h-full w-full items-center justify-center overflow-hidden bg-black/50 p-6 backdrop-blur-sm">
      <div className="animate-pop-in bg-background flex h-[min(calc(28rem*1.4),calc(100%-4rem))] w-md flex-col gap-3 rounded-lg p-6 shadow-2xl ring-2 ring-red-200">
        <AlertDialog.Title className="font-bold">
          Are you sure you want to transfer ownership of this club?
        </AlertDialog.Title>
        <p>
          Choose a member to transfer your admin privileges of the club. You
          will no longer be able to manage the club and handle requests.
        </p>
        <div
          className="h-full w-full overflow-x-hidden overflow-y-auto rounded-[calc(0.25rem+0.5rem)] bg-white p-2 shadow-sm ring-1 ring-gray-200"
          ref={containerRef}
        >
          <Virtuoso
            data={members}
            itemContent={(_, member) => (
              <div
                key={member.userId}
                className={cn(
                  "rounded p-1 transition hover:cursor-pointer",
                  selectedMember?.userId === member.userId
                    ? "bg-gray-900 text-white"
                    : "hover:bg-gray-200",
                )}
                onClick={() => setSelectedMember(member)}
              >
                {member.firstName}{" "}
                <span
                  className={cn(
                    selectedMember?.userId === member.userId
                      ? "text-white/70"
                      : "text-muted-foreground",
                  )}
                >
                  @{member.username}
                </span>
              </div>
            )}
            computeItemKey={(_, member) => member.userId}
            className="h-full"
            customScrollParent={containerRef.current}
          />
        </div>
        <AlertDialog.Cancel asChild>
          <Button variant={ButtonVariant.Special} className="w-full">
            No, I want to keep ownership of the club.
          </Button>
        </AlertDialog.Cancel>
        <Button
          variant={
            selectedMember ? ButtonVariant.Destructive : ButtonVariant.Muted
          }
          className="w-full"
          disabled={!selectedMember}
          isPending={isPending}
          onClick={() => {
            if (!selectedMember) {
              return;
            }

            setIsPending(true);
            transferClubOwnership({
              clubId: props.clubId,
              userId: selectedMember.userId,
            })
              .catch(() => setError("Failed to transfer ownership"))
              .then(() => setIsPending(false));
          }}
        >
          {selectedMember
            ? `Yes, I want to transfer ownership to ${selectedMember.firstName} (@
          ${selectedMember.username}).`
            : "Select a member to transfer ownership."}
        </Button>
        {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
      </div>
    </AlertDialog.Content>
  );
}
