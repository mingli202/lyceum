"use client";

import { Dialog } from "radix-ui";
import { Button, ButtonVariant } from "../ui";
import useFormState from "@/hooks/useFormState";
import { ProfilePicture } from "./ProfilePicture";
import { ProfileData } from "@convex/types";
import { X } from "lucide-react";

type EditProfileProps = {
  data: ProfileData;
};

export function EditProfile({ data }: EditProfileProps) {
  const [msg, handleSubmit, isPending] = useFormState(async (e) => {
    const formData = new FormData(e.target as HTMLFormElement);

    return null;
  });

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant={ButtonVariant.Muted}>Edit</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="animate-pop-in fixed top-1/2 left-1/2 z-10 h-fit -translate-1/2">
          <form
            onSubmit={handleSubmit}
            className="bg-background ring-foreground/10 m-2 flex w-lg flex-col gap-4 space-y-2 rounded-lg p-3 text-sm shadow-md ring-1 transition hover:z-10 hover:shadow-lg"
          >
            <div className="flex items-center gap-2">
              <Dialog.Close asChild>
                <Button variant={ButtonVariant.Muted} className="ring-0">
                  <X className="h-4 w-4" />
                </Button>
              </Dialog.Close>
              <Dialog.Title className="font-bold">Edit Profile</Dialog.Title>
            </div>

            <div className="flex w-full items-center gap-4 p-2">
              <ProfilePicture
                displayName={data.firstName}
                src={data.pictureUrl}
                className="h-16 w-16"
              />
              <label className="flex flex-col gap-1">
                <p>Profile Picture</p>
                <Button variant={ButtonVariant.Muted}>Change</Button>
              </label>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
