"use client";

import Image from "next/image";
import { Dialog } from "radix-ui";
import { Button, ButtonVariant } from "../ui";
import { useRef, useState } from "react";
import { LoadingSpinner } from "../LoadingSpinner";
import useFormState from "@/hooks/useFormState";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

type BannerPictureProps = {
  bannerUrl?: string;
  clubId?: Id<"clubs">;
};

export function BannerPicture(props: BannerPictureProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <div className="bg-muted-foreground/10 relative h-50 w-full hover:cursor-pointer">
          {props.bannerUrl ? (
            <Image
              src={props.bannerUrl}
              alt="banner"
              fill
              className="object-cover"
            />
          ) : null}
        </div>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="animate-pop-in fixed top-1/2 left-1/2 z-10 h-fit -translate-1/2">
          <UploadBannerPicture {...props} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function UploadBannerPicture(props: BannerPictureProps) {
  const { bannerUrl, clubId } = props;

  const [file, setFile] = useState<File | undefined | "remove">();
  const [isUploading, setIsUploading] = useState(false);

  const removeBannerPicture = useMutation(api.mutations.removeBannerPicture);
  const generateUploadUrl = useMutation(api.mutations.generateUploadUrl);
  const setBannerPicture = useMutation(api.mutations.setBannerPicture);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const localFileUrl = useRef<string>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  function handleFileUpload(uploadedFile?: File) {
    setIsUploading(false);

    if (!uploadedFile) {
      return;
    }

    if (localFileUrl.current) {
      URL.revokeObjectURL(localFileUrl.current);
    }
    localFileUrl.current = URL.createObjectURL(uploadedFile);

    setFile(uploadedFile);
  }

  const [msg, handleSubmit, isPending] = useFormState(async () => {
    if (!file) {
      return "Please upload a banner picture or remove the current one";
    }
    if (file === "remove") {
      await removeBannerPicture({ clubId });
    } else {
      const uploadUrl = await generateUploadUrl({});

      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      const res = await setBannerPicture({ storageId, clubId });

      if (res) {
        return res;
      }
    }

    closeButtonRef.current?.click?.();
  });

  return (
    <div className="bg-background w-[min(42rem,50vw)] overflow-hidden rounded-lg">
      <div className="bg-muted-foreground/10 relative h-50 w-full overflow-hidden">
        {file === "remove" ? null : localFileUrl.current || bannerUrl ? (
          <Image
            src={localFileUrl.current ?? bannerUrl ?? ""}
            alt="banner"
            fill
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="flex w-full items-center justify-between gap-4 p-4">
        <Dialog.Title>Edit Banner Picture</Dialog.Title>
        <form className="flex items-center gap-4" onSubmit={handleSubmit}>
          <label
            htmlFor="profile-picture"
            className="flex w-fit items-center justify-center rounded-md border-2 border-dashed border-indigo-300 px-2 py-1 transition hover:cursor-pointer hover:border-indigo-500"
            onClick={() => {
              if (isUploading) {
                return;
              }
              setIsUploading(true);

              // why is there no event listener for cancel? (v2)
              const f = () => setIsUploading(false);
              fileInputRef.current?.addEventListener("cancel", f, {
                once: true,
              });
            }}
          >
            {isUploading ? (
              <LoadingSpinner hideLoadingText className="h-5 w-5" />
            ) : (
              <>Change</>
            )}
            <input
              type="file"
              name="profile-picture"
              accept=".png, .jpg, .jpeg"
              id="profile-picture"
              className="hidden"
              onChange={(e) => {
                handleFileUpload(e.target.files?.[0]);
              }}
              ref={fileInputRef}
            />
          </label>
          <Button
            variant={ButtonVariant.Muted}
            onClick={() => setFile("remove")}
            type="button"
          >
            Remove
          </Button>
          <Button
            variant={ButtonVariant.Special}
            type="submit"
            className="flex items-center justify-center"
            isPending={isPending}
          >
            Save
          </Button>
        </form>
      </div>
      {msg && <p className="px-4 pb-4 text-red-500">{msg}</p>}
      <Dialog.Close className="hidden" ref={closeButtonRef} />
    </div>
  );
}
