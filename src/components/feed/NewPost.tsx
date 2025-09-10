"use client";

import {
  Button,
  ButtonVariant,
  Card,
  LoadingSpinner,
  ProfilePicture,
} from "@/components";
import useFormState from "@/hooks/useFormState";
import getImageDimensions from "@/utils/getImageDimensions";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { ImagePlus } from "lucide-react";
import NextImage from "next/image";
import { useEffect, useRef, useState } from "react";

export function NewPost({
  context: { refreshFeed, clubId, allowed },
}: {
  context: { refreshFeed: () => void; clubId?: Id<"clubs">; allowed?: boolean };
}) {
  const user = useQuery(api.queries.getUser, {});
  const newUserPost = useMutation(api.mutations.newUserPost);
  const generateUploadUrl = useMutation(api.mutations.generateUploadUrl);

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null!);
  const file = useRef<File | undefined>(undefined);

  const [localFileUrl, setLocalFileUrl] = useState<string | null>(null);

  const aspectRatio = useRef<number>(16 / 9);

  const [msg, handleSubmit, isPending] = useFormState(async (e) => {
    const form = e.target as HTMLFormElement;
    const formdata = new FormData(form);
    const description = formdata.get("description")!.toString();
    const isMembersOnly = formdata.get("isMembersOnly")?.toString() === "on";

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

    const res = await newUserPost({
      description,
      imageId,
      clubId,
      isMembersOnly,
    }).catch(() => "Something went wrong, try again.");

    if (res) {
      return res;
    }

    form.reset();

    file.current = undefined;
    aspectRatio.current = 16 / 9;
    textAreaRef.current.style.height = "auto";
    setLocalFileUrl(null);

    refreshFeed();
  });

  useEffect(() => {
    return () => {
      if (localFileUrl) {
        URL.revokeObjectURL(localFileUrl);
      }
    };
  }, [localFileUrl]);

  if (!allowed) {
    return null;
  }

  async function handleFileUpload(uploadedFile?: File) {
    setIsUploading(false);

    if (!uploadedFile) {
      return;
    }

    if (localFileUrl) {
      URL.revokeObjectURL(localFileUrl);
    }
    const url = URL.createObjectURL(uploadedFile);

    const { width, height } = await getImageDimensions(url);

    aspectRatio.current = Math.max(width / height, 9 / 16);

    setLocalFileUrl(url);

    file.current = uploadedFile;
  }

  return (
    <div className="flex w-full justify-center p-1">
      <Card className="w-full max-w-2xl flex-row gap-4">
        <ProfilePicture
          src={user && user !== "N/A" ? user.pictureUrl : undefined}
          displayName={user && user !== "N/A" ? user.givenName : "User"}
          className="h-9 w-9"
        />
        <form
          className="flex w-full flex-col gap-1 p-2"
          onSubmit={handleSubmit}
        >
          <textarea
            placeholder="What's happening?"
            className="w-full resize-none outline-none"
            id="description"
            name="description"
            rows={1}
            required
            disabled={isPending}
            ref={textAreaRef}
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
          <div className="flex items-center justify-between gap-4">
            <div>
              {clubId && (
                <label
                  className="flex items-center gap-2 text-sm"
                  htmlFor="isMembersOnly"
                >
                  <input
                    type="checkbox"
                    id="isMembersOnly"
                    name="isMembersOnly"
                  />
                  Restrict post to members only
                </label>
              )}
            </div>
            <div className="flex items-center gap-4">
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
          </div>
          {msg && <p className="px-4 pb-4 text-red-500">{msg}</p>}
        </form>
      </Card>
    </div>
  );
}
