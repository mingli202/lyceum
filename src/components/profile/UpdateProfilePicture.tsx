"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { ProfilePicture } from "./ProfilePicture";
import { LoadingSpinner } from "../LoadingSpinner";
import { Button, ButtonVariant } from "../ui";

type UpdateProfilePictureProps = {
  displayName: string;
  setFile: Dispatch<SetStateAction<File | undefined | "remove">>;
  file: File | undefined | "remove";
  src?: string;
};

// TODO: crop image and allow user to choose which part of the image to upload
// use this library: https://sharp.pixelplumbing.com/api-resize/
export function UpdateProfilePicture({
  displayName,
  setFile,
  file,
  src,
}: UpdateProfilePictureProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const localFileUrl = useRef<string>(null);

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

  useEffect(() => {
    return () => {
      if (localFileUrl.current) {
        URL.revokeObjectURL(localFileUrl.current);
      }
    };
  }, []);

  return (
    <div className="flex w-full items-center gap-4">
      <ProfilePicture
        displayName={displayName}
        src={file === "remove" ? undefined : (localFileUrl.current ?? src)}
        className="h-16 w-16"
      />
      <div className="justify-center-center flex flex-col gap-2">
        <p>Profile Picture</p>
        <div className="flex items-center gap-2">
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
        </div>
      </div>
    </div>
  );
}
