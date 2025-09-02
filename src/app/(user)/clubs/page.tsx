"use client";

import { LoadingSpinner } from "@/components";
import { api } from "@convex/_generated/api";
import { ClubPageData } from "@convex/types";
import { useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";

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
  return <div>club page</div>;
}
