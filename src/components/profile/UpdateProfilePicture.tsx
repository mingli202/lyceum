import { RefObject, useEffect, useRef, useState } from "react";
import { ProfilePicture } from "./ProfilePicture";
import { LoadingSpinner } from "../LoadingSpinner";

type UpdateProfilePictureProps = {
  displayName: string;
  fileRef: RefObject<File | null>;
  src?: string;
};

export function UpdateProfilePicture({
  displayName,
  fileRef,
  src,
}: UpdateProfilePictureProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const localFileUrl = useRef<string>(null);

  function handleFileUpload(file?: File) {
    setIsUploading(false);

    if (!file) {
      return;
    }

    if (localFileUrl.current) {
      URL.revokeObjectURL(localFileUrl.current);
    }
    localFileUrl.current = URL.createObjectURL(file);

    fileRef.current = file;
  }

  useEffect(() => {
    return () => {
      if (localFileUrl.current) {
        URL.revokeObjectURL(localFileUrl.current);
      }
    };
  }, []);

  return (
    <div className="flex w-full items-center gap-4 p-2">
      <ProfilePicture
        displayName={displayName}
        src={localFileUrl.current ?? src}
        className="h-16 w-16"
      />
      <div className="justify-center-center flex flex-col gap-2">
        <p>Profile Picture</p>
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
            // fileInputRef.current?.removeEventListener("change", f);
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
      </div>
    </div>
  );
}
