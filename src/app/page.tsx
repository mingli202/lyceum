"use client";

import { useLayoutEffect, useState } from "react";
import Login from "./login";
import { login } from "@/actions/auth";
import { useRouter } from "next/navigation";

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useLayoutEffect(() => {
    login().then((res) => {
      if (res.ok) {
        router.push("/dashboard");
      } else {
        setIsLoading(false);
      }
    });
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <Login />;
}
