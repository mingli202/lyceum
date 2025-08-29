"use client";

import {
  Button,
  ButtonVariant,
  Card,
  LoadingSpinner,
  ProfilePicture,
} from "@/components";
import useFormState from "@/hooks/useFormState";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { ImagePlus } from "lucide-react";
import NextImage from "next/image";
import { useEffect, useRef, useState } from "react";

export default function NewPost() {
  const user = useQuery(api.queries.getUser, {});
  const newUserPost = useMutation(api.mutations.newUserPost);
  const generateUploadUrl = useMutation(api.mutations.generateUploadUrl);

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const file = useRef<File | undefined>(undefined);

  const [localFileUrl, setLocalFileUrl] = useState<string | null>(null);

  const aspectRatio = useRef<number>(16 / 9);

  const [msg, handleSubmit, isPending] = useFormState(async (e) => {
    const formdata = new FormData(e.target as HTMLFormElement);
    const description = formdata.get("description")!.toString();

    let imageId: Id<"_storage"> | undefined;

    if (file.current) {
      const uploadUrl = await generateUploadUrl({});

      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.current.type },
        body: file.current,
      });
      const { storageId } = await result.json();
      imageId = storageId;
    }

    const res = await newUserPost({ description, imageId }).catch(() => null);

    if (res) {
      return "Something went wrong, try again.";
    }
  });

  async function handleFileUpload(uploadedFile?: File) {
    setIsUploading(false);

    if (!uploadedFile) {
      return;
    }

    if (localFileUrl) {
      URL.revokeObjectURL(localFileUrl);
    }
    const url = URL.createObjectURL(uploadedFile);

    const res: { height: number; width: number } = await new Promise(
      (resolve) => {
        const image = new Image();

        image.onload = () =>
          resolve({ height: image.height, width: image.width });

        image.src = url;
      },
    );

    aspectRatio.current = Math.max(res.width / res.height, 9 / 16);

    setLocalFileUrl(url);

    file.current = uploadedFile;
  }

  useEffect(() => {
    return () => {
      if (localFileUrl) {
        URL.revokeObjectURL(localFileUrl);
      }
    };
  }, []);

  return (
    <Card className="flex-row gap-4">
      <ProfilePicture
        src={user && user !== "N/A" ? user.pictureUrl : undefined}
        displayName={user && user !== "N/A" ? user.givenName : "User"}
        className="h-9 w-9"
      />
      <form className="flex w-full flex-col gap-1 p-2" onSubmit={handleSubmit}>
        <textarea
          placeholder="What's happening?"
          className="w-full resize-none outline-none"
          rows={1}
          required
          disabled={isPending}
          onChange={(e) => {
            // expand the textarea to fit the content
            const textArea = e.target as HTMLTextAreaElement;
            if (textArea) {
              textArea.style.height = "auto";
              textArea.style.height = textArea.scrollHeight + "px";
            }
          }}
        />
        {localFileUrl && (
          <div
            className="bg-foreground/10 relative w-full overflow-hidden rounded-md"
            style={{
              aspectRatio: aspectRatio.current,
            }}
          >
            <NextImage
              src={localFileUrl}
              alt="uploaded file"
              className="object-cover"
              fill
            />
          </div>
        )}
        <div className="flex items-center justify-end gap-4">
          <label
            htmlFor="file"
            className="w-fit hover:cursor-pointer"
            onClick={() => {
              if (isUploading) {
                return;
              }
              setIsUploading(true);

              // why is there no event listener for cancel? (v3)
              const f = () => setIsUploading(false);
              fileInputRef.current?.addEventListener("cancel", f, {
                once: true,
              });
            }}
          >
            {isUploading ? (
              <LoadingSpinner hideLoadingText className="h-4 w-4" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
            <input
              id="file"
              name="file"
              type="file"
              accept=".png, .jpg, .jpeg"
              className="hidden"
              onChange={(e) => {
                handleFileUpload(e.target.files?.[0]);
              }}
              ref={fileInputRef}
              disabled={isPending}
            />
          </label>
          <Button variant={ButtonVariant.Special} isPending={isPending}>
            Post
          </Button>
        </div>
        {msg && <p className="px-4 pb-4 text-red-500">{msg}</p>}
      </form>
    </Card>
  );
}
