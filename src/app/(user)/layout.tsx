"use client";

import { Authenticated } from "convex/react";
import Navbar from "./Navbar";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Authenticated>
      <div className="flex h-full w-full bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar />
        {children}
      </div>
    </Authenticated>
  );
}
