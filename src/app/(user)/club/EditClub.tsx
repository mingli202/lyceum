"use client";

import {
  Button,
  ButtonVariant,
  PaddingSize,
  UpdateProfilePicture,
} from "@/components";
import useFormState from "@/hooks/useFormState";
import { RecordValues } from "@/types";
import { ClubCategory, ClubPageData } from "@convex/types";
import { Settings, Users, X } from "lucide-react";
import { Dialog } from "radix-ui";
import { useRef, useState } from "react";

export default function EditClub(props: { data: ClubPageData }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant={ButtonVariant.Muted}>Manage</Button>
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

const Tab = {
  Settings: "Settings",
  Members: "Members",
} as const;

type Tab = RecordValues<typeof Tab>;

function EditClubTabs({ data }: { data: ClubPageData }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [selectedTab, setSelectedTab] = useState<Tab>(Tab.Settings);

  const iconMap: Record<Tab, React.ReactNode> = {
    [Tab.Settings]: <Settings className="h-4 w-4" />,
    [Tab.Members]: <Users className="h-4 w-4" />,
  };

  return (
    <div className="bg-background ring-foreground/10 m-2 flex w-md flex-col rounded-lg p-2 shadow-md ring-1 transition hover:z-10 hover:shadow-lg">
      <div className="flex items-center gap-2 p-2">
        <Dialog.Close asChild ref={closeButtonRef}>
          <Button
            variant={ButtonVariant.Muted}
            className="ring-0"
            paddingSize={PaddingSize.none}
          >
            <X className="h-4 w-4" />
          </Button>
        </Dialog.Close>
        <Dialog.Title className="font-bold">Manage Club</Dialog.Title>
      </div>
      <div className="bg-background flex gap-2 rounded-[calc(0.25rem+0.25rem)] p-1 shadow-sm">
        {Object.values(Tab).map((tab) => (
          <Button
            variant={selectedTab === tab ? "special" : undefined}
            className="flex w-full items-center justify-center gap-2 p-1"
            key={tab}
            onClick={() => setSelectedTab(tab)}
          >
            {iconMap[tab]}
            <p className="hidden sm:block">{tab}</p>
          </Button>
        ))}
      </div>
      {selectedTab === Tab.Settings && <EditClubSettingsTab data={data} />}
      {selectedTab === Tab.Members && <EditClubMembersTab data={data} />}
    </div>
  );
}

function EditClubSettingsTab({ data }: { data: ClubPageData }) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null!);

  const [file, setFile] = useState<File | undefined | "remove">();

  const [msg, handleSubmit, isPending] = useFormState(async (e) => {
    return null;
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
        <label htmlFor="first-name" className="w-full">
          <p>Club Name*</p>
          <input
            id="first-name"
            name="first-name"
            type="text"
            className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
            placeholder="e.g. Vincent"
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
          <p>Description</p>
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
            Delete
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
