"use client";

import {
  Button,
  ButtonVariant,
  LoadingSpinner,
  ProfilePicture,
} from "@/components";
import { BannerPicture } from "@/components";
import { api } from "@convex/_generated/api";
import { ClubPageData } from "@convex/types";
import { useQuery, useMutation } from "convex/react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import EditClub from "./EditClub";
import MemberRequestDialog from "./MemberRequestDialog";
import ClubTabs from "./ClubTabs";

export default function ClubPage() {
  const searchParams = useSearchParams();

  const id = searchParams.get("id")?.toString();
  const clubData = useQuery(api.queries.getClubPage, { clubId: id });

  if (!clubData) {
    return <LoadingSpinner />;
  }

  if (typeof clubData === "string") {
    return (
      <div className="flex h-full w-full items-center justify-center text-red-500">
        {clubData}
      </div>
    );
  }

  return <Club data={clubData} />;
}

type ClubProps = {
  data: ClubPageData;
};
function Club({ data }: ClubProps) {
  const memberInfo = data.memberInfo;
  const isCurrentUserAdmin = memberInfo?.userStatus === "admin";

  const joinClub = useMutation(api.mutations.joinClub);
  const leaveClub = useMutation(api.mutations.leaveClub);

  return (
    <div className="flex h-full w-full justify-center overflow-x-hidden overflow-y-auto">
      <section className="flex h-fit w-full max-w-2xl flex-col pb-6">
        {isCurrentUserAdmin ? (
          <BannerPicture bannerUrl={data.bannerUrl} clubId={data.clubId} />
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
        <div className="relative flex w-full flex-col items-center gap-2 pt-14">
          <ProfilePicture
            src={data.pictureUrl}
            displayName={data.name}
            className="absolute top-0 left-1/2 h-24 w-24 -translate-1/2"
            displayRing
          />

          <p className="text-center text-xl font-bold">{data.name}</p>
          <div className="flex gap-2 text-sm">
            <p className="flex items-center gap-1">
              <span className="font-bold">{data.nMembers}</span>
              <span className="text-muted-foreground">
                member{data.nMembers > 1 ? "s" : ""}
              </span>
            </p>
            <p className="flex items-center gap-1">
              <span className="font-bold">{data.nFollowers}</span>
              <span className="text-muted-foreground">followers</span>
            </p>
          </div>
          {isCurrentUserAdmin ? (
            <div className="flex w-full items-center justify-center gap-2">
              <MemberRequestDialog clubId={data.clubId} />
              <EditClub data={data} />
            </div>
          ) : data.memberInfo ? (
            <>
              {data.memberInfo.userStatus === "member" ? (
                <Button
                  variant={ButtonVariant.Destructive}
                  onClick={async () => {
                    await leaveClub({
                      clubId: data.clubId,
                    });
                  }}
                >
                  Leave
                </Button>
              ) : (
                <Button
                  variant={ButtonVariant.Muted}
                  onClick={() => {
                    joinClub({ clubId: data.clubId });
                  }}
                >
                  {data.memberInfo.userStatus[0].toUpperCase() +
                    data.memberInfo.userStatus.slice(1)}
                </Button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant={ButtonVariant.Special}
                onClick={async () => {
                  await joinClub({ clubId: data.clubId });
                }}
              >
                Join
              </Button>
              <Button
                variant={ButtonVariant.Muted}
                onClick={async () => {
                  await joinClub({ clubId: data.clubId, follow: true });
                }}
              >
                Follow
              </Button>
            </div>
          )}
        </div>
        <ClubTabs />
      </section>
    </div>
  );
}
