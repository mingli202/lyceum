import { UpdateProfilePicture, Button, ButtonVariant } from "@/components";
import useFormState from "@/hooks/useFormState";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { ClubPageData, ClubCategory } from "@convex/types";
import { useMutation } from "convex/react";
import { RefObject, useRef, useState } from "react";

export default function EditClubSettingsTab({
  data,
  closeButtonRef,
}: {
  data: ClubPageData;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
}) {
  const updateClubInfo = useMutation(api.mutations.updateClubInfo);
  const generateUploadUrl = useMutation(api.mutations.generateUploadUrl);
  const removeClubPicture = useMutation(api.mutations.removeClubPicture);

  const textAreaRef = useRef<HTMLTextAreaElement>(null!);
  const [file, setFile] = useState<File | undefined | "remove">();

  const [msg, handleSubmit, isPending] = useFormState(async (e) => {
    const form = e.target as HTMLFormElement;

    const formData = new FormData(form);
    const name = formData.get("club-name")?.toString() ?? data.name;
    const description =
      formData.get("club-description")?.toString() ?? data.description;
    const category = formData.get("club-category")?.toString() ?? data.category;
    const allowMemberPost =
      formData.get("allow-members-post")?.toString() === "on"
        ? true
        : data.allowMemberPost;
    const isPrivate =
      formData.get("is-private")?.toString() === "on" ? true : data.isPrivate;

    let pictureId: Id<"_storage"> | undefined = undefined;
    if (file === "remove") {
      await removeClubPicture({ clubId: data.clubId });
    } else if (file) {
      const uploadUrl = await generateUploadUrl({});

      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      pictureId = storageId;
    }

    const res = await updateClubInfo({
      clubId: data.clubId,
      name,
      description,
      category: category as ClubCategory,
      allowMemberPost,
      isPrivate,
      pictureId,
    }).catch(() => "Error, try again");

    if (res) {
      return res;
    }

    closeButtonRef.current?.click();
  });

  return (
    <form className="flex flex-col gap-3 p-2" onSubmit={handleSubmit}>
      <UpdateProfilePicture
        displayName={data.name}
        src={data.pictureUrl}
        file={file}
        setFile={setFile}
      />

      <div className="flex w-full flex-col gap-3">
        <label htmlFor="club-name" className="w-full">
          <p>Club Name*</p>
          <input
            id="club-name"
            name="club-name"
            type="text"
            className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
            placeholder="e.g. Rustaceans"
            required
            defaultValue={data.name}
          />
        </label>

        <label htmlFor="club-category">
          <p>Club Category*</p>
          <select
            id="club-category"
            name="club-category"
            className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
            required
            defaultValue={data.category}
          >
            {ClubCategory.members.map((category) => (
              <option key={category.value} value={category.value}>
                {category.value}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="club-description">
          <p>Description*</p>
          <textarea
            id="club-description"
            name="club-description"
            className="mt-1 w-full resize-none rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
            placeholder="Provide a brief description of your club"
            required
            defaultValue={data.description}
            ref={textAreaRef}
            rows={2}
            onChange={(e) => {
              // expand the textarea to fit the content
              const textArea = e.target as HTMLTextAreaElement;
              if (textArea) {
                textArea.style.height = "auto";
                textArea.style.height = textArea.scrollHeight + "px";
              }
            }}
          />
        </label>

        <label
          htmlFor="allow-members-post"
          className="flex w-full items-center gap-2"
        >
          <input
            id="allow-members-post"
            name="allow-members-post"
            type="checkbox"
            className="rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
            defaultChecked={data.allowMemberPost}
          />
          <p>Allow members to post</p>
        </label>
        <label htmlFor="is-private" className="flex w-full items-center gap-2">
          <input
            id="is-private"
            name="is-private"
            type="checkbox"
            className="rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
            defaultChecked={data.isPrivate}
          />
          <p>Users must request to join</p>
        </label>

        <div className="flex w-full items-center justify-between gap-3">
          <Button variant={ButtonVariant.Destructive} type="button">
            Disband
          </Button>
          <Button
            variant={ButtonVariant.Special}
            type="submit"
            isPending={isPending}
          >
            Update
          </Button>
        </div>
        {msg && <p className="text-red-500">{msg}</p>}
      </div>
    </form>
  );
}
