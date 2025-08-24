"use client";

import { Button } from "@/components";
import { ProfileData } from "@convex/types";
import { GraduationCap, School } from "lucide-react";
import Image from "next/image";
import UserActivity from "./UserActivity";

type ProfileProps = {
  data: ProfileData;
};
export default function Profile({ data }: ProfileProps) {
  return (
    <div className="flex w-full justify-center">
      <section className="flex w-lg flex-col gap-4 py-8">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full">
            {data.pictureUrl ? (
              <Image
                src={data.pictureUrl}
                alt={data.firstName}
                className="h-full w-full"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-200">
                {data.firstName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="shrink-0">
            <p className="">
              {data.firstName} {data.lastName}
            </p>
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
        <UserActivity />
      </section>
    </div>
  );
}
