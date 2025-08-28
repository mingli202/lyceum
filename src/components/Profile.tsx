"use client";

import { ProfileData } from "@convex/types";
import { GraduationCap, MapPin, School } from "lucide-react";
import { ProfilePicture } from "@/components/ProfilePicture";
import { Button, ButtonVariant } from "@/components";
import UserActivity from "./UserActivity";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";

type ProfileProps = {
  data: ProfileData;
  currentClerkId?: string | null;
};
export function Profile({ data, currentClerkId }: ProfileProps) {
  const followUser = useMutation(api.mutations.followUser);

  let buttonText = "Follow";

  if (data.canView.canView) {
    if (data.canView.reason === "Following") {
      buttonText = "Unfollow";
    }
  } else {
    if (data.canView.reason === "Requested") {
      buttonText = "Requested";
    }
  }

  return (
    <div className="flex h-full w-full justify-center overflow-x-hidden overflow-y-auto">
      <section className="flex h-fit w-full max-w-2xl flex-col">
        <div className="bg-muted-foreground/10 relative h-50 w-full">
          <ProfilePicture
            src={data.pictureUrl}
            displayName={data.firstName}
            className="absolute bottom-0 left-6 h-34 w-34 translate-y-1/2"
          />
        </div>
        <div className="flex w-full justify-end p-6">
          {currentClerkId && data.clerkId === currentClerkId ? (
            <Button variant={ButtonVariant.Muted}>Edit</Button>
          ) : (
            <Button
              variant={
                buttonText === "Follow"
                  ? ButtonVariant.Special
                  : ButtonVariant.Muted
              }
              onClick={async () => {
                if (data.canView.reason === "Blocked") {
                  return;
                }
                await followUser({ userId: data.userId });
              }}
              disabled={data.canView.reason === "Blocked"}
            >
              {buttonText}
            </Button>
          )}
        </div>
        <div className="flex flex-col justify-between gap-2 px-6 text-sm">
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              <p className="text-2xl font-bold overflow-ellipsis whitespace-nowrap">
                {data.firstName} {data.lastName}
              </p>
              <p className="text-muted-foreground">@{data.username}</p>
            </div>
            <div className="basis-full" />
          </div>
          {data.bio && <div>{data.bio}</div>}

          <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-0">
            <div className="flex items-center gap-1">
              <School className="h-4 w-4" />
              <span>{data.school}</span>
            </div>
            <div className="flex items-center gap-1">
              <GraduationCap className="h-4 w-4" />
              <span>
                {data.academicYear - 2024}st Year · {data.major}
              </span>
            </div>
            {data.city && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{data.city}</span>
              </div>
            )}
          </div>

          <div className="mb-4 flex gap-2">
            <p>
              <span className="font-bold">{data.nFollowers + " "}</span>
              <span className="text-muted-foreground">Followers</span>
            </p>
            <p>
              <span className="font-bold">{data.nFollowing + " "}</span>
              <span className="text-muted-foreground">Following</span>
            </p>
          </div>
        </div>
        <UserActivity canView={data.canView} requestedUserId={data.userId} />
      </section>
    </div>
  );
}
