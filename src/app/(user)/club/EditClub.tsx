"use client";

import { Button, ButtonVariant } from "@/components";
import { ClubPageData } from "@convex/types";
import { Dialog } from "radix-ui";
import EditClubTabs from "./EditClubTabs";

export default function EditClub(props: { data: ClubPageData }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant={ButtonVariant.Muted}>Settings</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="animate-pop-in fixed top-1/2 left-1/2 z-10 h-fit -translate-1/2">
          <EditClubTabs {...props} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
