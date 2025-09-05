"use client";

import { Dialog } from "radix-ui";
import { Button, ButtonVariant, PaddingSize } from "../ui";
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
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant={ButtonVariant.Muted}>Edit</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="animate-pop-in fixed top-1/2 left-1/2 z-10 h-fit -translate-1/2">
          <EditProfileForm data={data} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function EditProfileForm({ data }: { data: ProfileData }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [file, setFile] = useState<File | undefined | "remove">();

  const { user } = useUser();
  const updateProfile = useMutation(api.mutations.updateProfile);
  const removeProfilePicture = useMutation(api.mutations.removeProfilePicture);

  const [msg, handleSubmit, isPending] = useFormState(async (e) => {
    if (!user) {
      return "Login expired, please login again";
    }

    let imageUrl: string | undefined = data.pictureUrl;
    if (file) {
      if (file === "remove") {
        await user.setProfileImage({ file: null });
        await removeProfilePicture({});
        imageUrl = undefined;
      } else {
        const imageResource = await user.setProfileImage({
          file,
        });
        imageUrl = imageResource.publicUrl ?? undefined;
      }
    }

    const formData = new FormData(e.target as HTMLFormElement);

    const firstName = formData.get("first-name")?.toString();
    const lastName = formData.get("last-name")?.toString();
    const school = formData.get("school")?.toString();
    const major = formData.get("major")?.toString();
    const username = formData.get("username")?.toString();
    const academicYear = formData.get("academic-year")?.toString();
    const city = formData.get("city")?.toString();
    const bio = formData.get("bio")?.toString();
    const isPrivate = formData.get("is-private")?.toString() === "on";

    const res = await updateProfile({
      updatedUserInfo: {
        givenName:
          firstName && firstName !== data.firstName ? firstName : undefined,
        familyName:
          lastName && lastName !== data.lastName ? lastName : undefined,
        username: username && username !== data.username ? username : undefined,
        pictureUrl: imageUrl,
      },
      updatedProfileInfo: {
        academicYear:
          academicYear && Number(academicYear) !== data.academicYear
            ? Number(academicYear)
            : undefined,
        major: major && major !== data.major ? major : undefined,
        city,
        bio,
        school: school && school !== data.school ? school : undefined,
        isPrivate,
      },
    }).catch(() => "Error updating profile");

    if (res) {
      return res;
    }

    closeButtonRef.current?.click();
  });

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-background ring-foreground/10 m-2 flex w-lg flex-col gap-3 rounded-lg p-5 shadow-md ring-1 transition hover:z-10 hover:shadow-lg"
    >
      <div className="flex items-center gap-2">
        <Dialog.Close asChild ref={closeButtonRef}>
          <Button
            variant={ButtonVariant.Muted}
            className="ring-0"
            paddingSize={PaddingSize.none}
          >
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

      <div className="flex w-full items-center gap-3">
        <label htmlFor="first-name" className="w-full">
          <p>First Name*</p>
          <input
            id="first-name"
            name="first-name"
            type="text"
            className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
            placeholder="e.g. Vincent"
            required
            defaultValue={data.firstName}
          />
        </label>
        <label htmlFor="last-name" className="w-full">
          <p>Last Name</p>
          <input
            id="last-name"
            name="last-name"
            type="text"
            className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
            placeholder="e.g. Lu"
            defaultValue={data.lastName}
          />
        </label>
      </div>

      <label htmlFor="school" className="w-full">
        <p>School</p>
        <input
          id="school"
          name="school"
          type="text"
          className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
          placeholder="e.g. Western University"
          defaultValue={data.school}
          required
        />
      </label>
      <label htmlFor="major" className="w-full">
        <p>Major*</p>
        <input
          id="major"
          name="major"
          type="text"
          className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
          placeholder="e.g. Computer Science"
          defaultValue={data.major}
          required
        />
      </label>

      <div className="flex w-full items-center gap-3">
        <label htmlFor="username" className="w-full">
          <p>Username*</p>
          <input
            id="username"
            name="username"
            type="text"
            className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
            placeholder="e.g. vincentlu"
            required
            defaultValue={data.username}
          />
        </label>

        <label htmlFor="academic-year" className="w-full">
          <p>Academic Year*</p>
          <input
            id="academic-year"
            name="academic-year"
            type="text"
            className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
            placeholder="e.g. 2025"
            defaultValue={data.academicYear}
            required
          />
        </label>
      </div>

      <label htmlFor="city" className="w-full">
        <p>City</p>
        <input
          id="city"
          name="city"
          type="text"
          className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
          placeholder="e.g. Ontario, London"
          defaultValue={data.city}
        />
      </label>

      <label htmlFor="bio" className="w-full">
        <p>Short bio</p>
        <input
          id="bio"
          name="bio"
          type="text"
          className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
          placeholder="e.g. I use Neovim (btw)"
          defaultValue={data.bio}
        />
      </label>

      <label htmlFor="email" className="w-full">
        <p>Email*</p>
        <input
          id="email"
          name="email"
          type="email"
          className="bg-foreground/10 text-foreground/50 mt-1 w-full cursor-not-allowed rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
          disabled
          required
          value={data.email}
        />
      </label>

      <label htmlFor="is-private" className="flex w-full items-center gap-2">
        <input
          id="is-private"
          name="is-private"
          type="checkbox"
          className="rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
          defaultChecked={data.isPrivate}
        />
        <p>Private Account</p>
      </label>

      {msg && <p className="text-red-500">{msg}</p>}
      <div className="flex items-center justify-between gap-2">
        <Button variant={ButtonVariant.Destructive} type="button">
          Delete
        </Button>

        <div className="flex items-center gap-2">
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
      </div>
    </form>
  );
}
