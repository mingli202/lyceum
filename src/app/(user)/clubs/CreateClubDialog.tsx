"use client";

import { Button, ButtonVariant } from "@/components";
import useFormState from "@/hooks/useFormState";
import { api } from "@convex/_generated/api";
import { ClubCategory } from "@convex/types";
import { useMutation } from "convex/react";
import { Plus } from "lucide-react";
import { Dialog } from "radix-ui";
import { useRef } from "react";

export default function CreateClubDialog() {
  const createClub = useMutation(api.mutations.createClub);
  const textAreaRef = useRef<HTMLTextAreaElement>(null!);
  const closeButtonRef = useRef<HTMLButtonElement>(null!);

  const [msg, handleSubmit, isPending] = useFormState(async (e) => {
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const clubName = formData.get("club-name")?.toString();
    const clubCategory = formData.get("club-category")?.toString();
    const clubDescription = formData.get("club-description")?.toString();
    const allowMemberPost =
      formData.get("allow-members-post")?.toString() === "on";
    const isPrivate = formData.get("is-private")?.toString() === "on";

    if (
      !clubName ||
      !clubDescription ||
      ClubCategory.members.findIndex((c) => c.value === clubCategory) === -1
    ) {
      return "Please fill out all required fields";
    }

    const res = await createClub({
      name: clubName,
      description: clubDescription,
      category: clubCategory as ClubCategory,
      allowMemberPost,
      isPrivate,
    }).catch(() => "Opps something went wrong");

    if (res) {
      return res;
    }

    form.reset();
    closeButtonRef.current?.click();
  });

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button
          variant={ButtonVariant.Special}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create a club
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="animate-pop-in fixed top-1/2 left-1/2 z-10 h-fit -translate-1/2">
          <form
            className="bg-background flex w-md flex-col gap-3 rounded-lg p-6"
            onSubmit={handleSubmit}
          >
            <Dialog.Title className="font-bold">Create a club</Dialog.Title>

            <label htmlFor="club-name">
              <p>Club Name*</p>
              <input
                id="club-name"
                name="club-name"
                type="text"
                className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
                placeholder="e.g. Varsity Badminton Club"
                required
              />
            </label>

            <label htmlFor="club-category">
              <p>Club Category*</p>
              <select
                id="club-category"
                name="club-category"
                className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
                required
              >
                {ClubCategory.members.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.value}
                  </option>
                ))}
              </select>
            </label>

            <label htmlFor="club-description">
              <p>Description</p>
              <textarea
                id="club-description"
                name="club-description"
                className="mt-1 w-full resize-none rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
                placeholder="Provide a brief description of your club"
                required
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
              />
              <p>Allow members to post</p>
            </label>
            <label
              htmlFor="is-private"
              className="flex w-full items-center gap-2"
            >
              <input
                id="is-private"
                name="is-private"
                type="checkbox"
                className="rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
              />
              <p>Users must request to join</p>
            </label>

            <div className="flex w-full items-center justify-end gap-3">
              <Dialog.Close asChild ref={closeButtonRef}>
                <Button variant={ButtonVariant.Muted} type="button">
                  Close
                </Button>
              </Dialog.Close>
              <Button
                variant={ButtonVariant.Special}
                type="submit"
                isPending={isPending}
              >
                Submit
              </Button>
            </div>
            {msg && <p className="text-red-500">{msg}</p>}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
