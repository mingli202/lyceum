"use client";

import { LoadingSpinner } from "@/components/ui";
import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";

export default function Page() {
  const auth = useConvexAuth();
  const router = useRouter();

  if (auth.isAuthenticated) {
    router.push("/user/dashboard");
  }

  if (auth.isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <LoadingSpinner />;
      </div>
    );
  }

  return <div className="h-full w-full">Welcome to Campus Clip</div>;
}
