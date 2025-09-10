"use client";

import { LoadingSpinner } from "@/components";
import { SignInButton } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { useLayoutEffect } from "react";

export default function Page() {
  const auth = useConvexAuth();
  const router = useRouter();

  useLayoutEffect(() => {
    if (auth.isAuthenticated) {
      router.push("/dashboard");
    }
  }, [auth.isAuthenticated]);

  if (auth.isLoading || auth.isAuthenticated) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2">
      <div>TODO: HERO PAGE</div>
      <h1 className="text-3xl font-bold">Welcome to Campus Clip</h1>
      <p>The plateform that clips together every area of your life!</p>
      <SignInButton>
        <p className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:cursor-pointer hover:bg-blue-700">
          Sign in to get started
        </p>
      </SignInButton>
    </div>
  );
}
