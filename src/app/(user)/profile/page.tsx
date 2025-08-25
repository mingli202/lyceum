"use client";

import Profile from "./Profile";
import { api } from "@convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { LoadingSpinner } from "@/components";

export default function ProfilePage() {
  const { userId } = useAuth();
  const data = useQuery(api.queries.getProfileData, {});

  if (!data || !userId) {
    return <LoadingSpinner />;
  }

  return <Profile data={data} currentClerkId={userId!} />;
}
