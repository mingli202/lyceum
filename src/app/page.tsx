"use client";

import { useLayoutEffect, useState } from "react";
import Login from "./login";
import { login } from "@/actions/auth";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/ui/loadingSpinner";

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useLayoutEffect(() => {
    (async () => {
      const res = await login();
      if (res.ok) {
        router.push("/dashboard");
      } else {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return <Login />;
}
