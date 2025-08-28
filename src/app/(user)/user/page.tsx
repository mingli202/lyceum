"use client";

import { LoadingSpinner, Profile } from "@/components";
import { useAuth } from "@clerk/nextjs";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";

export default function UserPage() {
  const { userId } = useAuth();

  const searchParams = useSearchParams();
  const id = searchParams.get("id")?.toString();

  const profileData = useQuery(api.queries.getProfileData, {
    requestedUserId: id as Id<"users">,
  });

  if (!profileData) {
    return <LoadingSpinner />;
  }

  if (typeof profileData === "string") {
    return (
      <div className="flex h-full w-full items-center justify-center text-red-500">
        {profileData}
      </div>
    );
  }

  return <Profile data={profileData} currentClerkId={userId} />;
}
