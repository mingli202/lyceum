"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import Navbar from "./Navbar";
import { LoadingSpinner } from "@/components";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Authenticated>
        <div className="flex h-full w-full bg-gradient-to-br from-slate-50 to-blue-50">
          <Navbar />
          {children}
        </div>
      </Authenticated>
      <Unauthenticated>
        <LoadingSpinner />
      </Unauthenticated>
    </>
  );
}
