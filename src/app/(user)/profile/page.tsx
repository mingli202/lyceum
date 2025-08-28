"use client";

import { api } from "@convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { LoadingSpinner, Profile } from "@/components";

export default function ProfilePage() {
  const { userId } = useAuth();
  const data = useQuery(api.queries.getProfileData, {});

  if (!data) {
    return <LoadingSpinner />;
  }

  if (typeof data === "string") {
    return (
      <div className="flex h-full w-full items-center justify-center text-red-500">
        {data}
      </div>
    );
  }

  return <Profile data={data} currentClerkId={userId} />;
}
