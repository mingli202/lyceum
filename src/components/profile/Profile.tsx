"use client";

import { CanView, ProfileData } from "@convex/types";
import { GraduationCap, MapPin, School } from "lucide-react";
import { EditProfile, ProfilePicture } from "@/components";
import { Button, ButtonVariant, LoadingSpinner } from "@/components";
import UserActivity from "./UserActivity";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Id } from "@convex/_generated/dataModel";
import parseTimestamp from "@/utils/parseTimestamp";
import { BannerPicture } from "./BannerPicture";
import Image from "next/image";

type ProfilePageProps = {
  isOwner?: boolean;
};
export function ProfilePage({ isOwner }: ProfilePageProps) {
  const { userId } = useAuth();

  const searchParams = useSearchParams();
  const id = isOwner ? undefined : searchParams.get("id")?.toString();

  const data: ProfileData | undefined | string = useQuery(
    api.queries.getProfileData,
    {
      requestedUserId: id as Id<"users"> | undefined,
    },
  );
  const canView = useQuery(api.queries.getCanViewUserInfo, {
    requestedUserId: id as Id<"users"> | undefined,
  });

  if (!data || !canView) {
    return <LoadingSpinner />;
  }

  if (typeof data === "string") {
    return (
      <div className="flex h-full w-full items-center justify-center text-red-500">
        {data}
      </div>
    );
  }

  return <Profile data={data} currentClerkId={userId} canView={canView} />;
}

type ProfileProps = {
  data: ProfileData;
  canView: CanView;
  currentClerkId?: string | null;
};
export function Profile({ data, currentClerkId, canView }: ProfileProps) {
  const followUser = useMutation(api.mutations.followUser);

  const nFollowers = useQuery(api.queries.getFollowerCount, {
    userId: data.userId,
  });

  const nFollowing = useQuery(api.queries.getFollowingCount, {
    userId: data.userId,
  });

  const lastSeenAt = useQuery(api.queries.getUserLastSeenAt, {
    userId: data.userId,
  });

  let buttonTextTmp = "Follow";

  if (canView.canView) {
    if (canView.reason === "Following") {
      buttonTextTmp = "Unfollow";
    }
  } else {
    if (canView.reason === "Requested") {
      buttonTextTmp = "Requested";
    }
  }

  const [buttonText, setButtonText] = useState(buttonTextTmp);

  const isOwner =
    (currentClerkId && currentClerkId === data.userId) ||
    canView.reason === "Own account";

  useEffect(() => {
    setButtonText(buttonTextTmp);
  }, [buttonTextTmp]);

  return (
    <>
      <div className="flex h-full w-full justify-center overflow-x-hidden overflow-y-auto">
        <section className="flex h-fit w-full max-w-2xl flex-col">
          {isOwner ? (
            <BannerPicture bannerUrl={data.bannerUrl} />
          ) : (
            <div className="bg-muted-foreground/10 relative h-50 w-full">
              {data.bannerUrl ? (
                <Image
                  src={data.bannerUrl}
                  alt="banner"
                  fill
                  className="object-cover"
                />
              ) : null}
            </div>
          )}
          <div className="relative flex w-full justify-end p-6">
            <ProfilePicture
              src={data.pictureUrl}
              displayName={data.firstName}
              className="absolute top-0 left-6 h-34 w-34 -translate-y-1/2"
            />

            {isOwner ? (
              <EditProfile data={data} />
            ) : (
              <Button
                variant={
                  buttonText === "Follow"
                    ? ButtonVariant.Special
                    : ButtonVariant.Muted
                }
                onClick={async () => {
                  if (canView.reason === "Blocked") {
                    return;
                  }

                  followUser({ userId: data.userId });
                  // immediate feedback
                  if (canView.reason === "Public account") {
                    setButtonText("Unfollow");
                  } else if (
                    canView.reason === "Requested" ||
                    canView.reason === "Following"
                  ) {
                    setButtonText("Follow");
                  } else if (canView.reason === "Private account") {
                    setButtonText("Requested");
                  }
                }}
                disabled={canView.reason === "Blocked"}
              >
                {buttonText}
              </Button>
            )}
          </div>
          <div className="flex flex-col justify-between gap-2 px-6 text-sm">
            <div className="flex items-center gap-4">
              <div className="shrink-0">
                <div className="flex items-center gap-4">
                  <p className="truncate text-2xl font-bold">
                    {data.firstName} {data.lastName}
                  </p>
                  {lastSeenAt &&
                    (Date.now() - lastSeenAt < 1000 * 60 * 11 ? (
                      <div className="flex shrink-0 items-center gap-2 rounded-full bg-emerald-200 px-2 py-1 text-xs text-emerald-800 ring-1 ring-emerald-500">
                        online
                      </div>
                    ) : (
                      <p className="flex shrink-0 items-center gap-2 rounded-full bg-slate-200 px-2 py-1 text-xs text-slate-800 ring-1 ring-slate-500">
                        last seen {parseTimestamp(lastSeenAt)}
                      </p>
                    ))}
                </div>
                <p className="text-muted-foreground">@{data.username}</p>
              </div>
              <div className="basis-full" />
            </div>
            {data.bio && data.bio.trim() !== "" && <div>{data.bio}</div>}

            <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-0">
              <div className="flex items-center gap-1">
                <School className="h-4 w-4" />
                <span>{data.school}</span>
              </div>
              <div className="flex items-center gap-1">
                <GraduationCap className="h-4 w-4" />
                <span>
                  {formatAcademicYear(data.academicYear)} · {data.major}
                </span>
              </div>
              {data.city && data.city.trim() !== "" && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{data.city}</span>
                </div>
              )}
            </div>

            <div className="mb-4 flex gap-2">
              <p className="flex items-center gap-1">
                <span className="font-bold">{nFollowers ?? 0}</span>
                <span className="text-muted-foreground">Followers</span>
              </p>
              <p className="flex items-center gap-1">
                <span className="font-bold">{nFollowing ?? 0}</span>
                <span className="text-muted-foreground">Following</span>
              </p>
            </div>
          </div>
          <UserActivity canView={canView} requestedUserId={data.userId} />
        </section>
      </div>
    </>
  );
}

function formatAcademicYear(academicYear: number) {
  const year = new Date().getFullYear() - academicYear + 1;

  if (year < 1) {
    return `Incoming ${academicYear}`;
  }

  let modifier = "th";
  if (year === 1) {
    modifier = "st";
  } else if (year === 2) {
    modifier = "nd";
  } else if (year === 3) {
    modifier = "rd";
  } else if (year > 5) {
    modifier = "";
  }

  return `${year}${modifier} Year`;
}
