"use client";

import { Button } from "@/components";
import { ProfileData } from "@convex/types";
import { GraduationCap, School } from "lucide-react";
import UserActivity from "./UserActivity";
import { ProfilePicture } from "@/components/ProfilePicture";

type ProfileProps = {
  data: ProfileData;
};
export default function Profile({ data }: ProfileProps) {
  return (
    <div className="flex h-full w-full justify-center overflow-x-hidden overflow-y-auto">
      <section className="flex h-fit w-full max-w-xl flex-col gap-4 p-8">
        <div className="flex items-center gap-4">
          <ProfilePicture
            src={data.pictureUrl}
            displayName={data.firstName}
            className="h-16 w-16"
          />
          <div className="shrink-0">
            <p className="overflow-ellipsis whitespace-nowrap">
              {data.firstName} {data.lastName}
            </p>
            <p className="text-foreground/60">@{data.username}</p>
            <div className="text-foreground/60 flex gap-2 text-sm">
              <p>{data.followers.length} Followers</p>
              <p>{data.following.length} Following</p>
            </div>
          </div>
          <div className="basis-full" />
          <Button variant="special">Follow</Button>
        </div>
        <div className="space-y-1">
          <div className="flex gap-2">
            <School />
            <span>
              {data.school} {data.academicYear}
            </span>
          </div>
          <div className="flex gap-2">
            <GraduationCap />
            <span>{data.major}</span>
          </div>
        </div>
        {data.bio && <div>{data.bio}</div>}
        <UserActivity />
      </section>
    </div>
  );
}
