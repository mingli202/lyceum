"use client";

import { Dialog } from "radix-ui";
import { Button, ButtonVariant } from "../ui";
import useFormState from "@/hooks/useFormState";
import { ProfileData } from "@convex/types";
import { X } from "lucide-react";
import { useRef, useState } from "react";
import { UpdateProfilePicture } from "./UpdateProfilePicture";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";

type EditProfileProps = {
  data: ProfileData;
};

export function EditProfile({ data }: EditProfileProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [file, setFile] = useState<File | undefined | "remove">();

  const { user } = useUser();
  const updateProfile = useMutation(api.mutations.updateProfile);
  const removeProfilePicture = useMutation(api.mutations.removeProfilePicture);

  const [msg, handleSubmit, isPending] = useFormState(async (e) => {
    if (!user) {
      return "Login expired, please login again";
    }

    let imageUrl: string | undefined;
    if (file) {
      if (file === "remove") {
        await user.setProfileImage({ file: null });
        await removeProfilePicture({});
      } else {
        const imageResource = await user.setProfileImage({
          file,
        });
        imageUrl = imageResource.publicUrl ?? undefined;
      }
    }

    const formData = new FormData(e.target as HTMLFormElement);

    await updateProfile({
      updatedProfileInfo: {},
      updatedUserInfo: { pictureUrl: imageUrl },
    });

    closeButtonRef.current?.click();
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
              <Dialog.Close asChild ref={closeButtonRef}>
                <Button variant={ButtonVariant.Muted} className="ring-0">
                  <X className="h-4 w-4" />
                </Button>
              </Dialog.Close>
              <Dialog.Title className="font-bold">Edit Profile</Dialog.Title>
            </div>

            <UpdateProfilePicture
              displayName={data.firstName}
              src={data.pictureUrl}
              file={file}
              setFile={setFile}
            />

            <div className="flex items-center justify-end gap-2">
              <Button
                variant={ButtonVariant.Muted}
                type="button"
                onClick={() => {
                  closeButtonRef.current?.click();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isPending={isPending}
                variant={ButtonVariant.Special}
              >
                Save
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
