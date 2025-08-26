"use client";

import Dashboard from "./Dashboard";
import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { LoadingSpinner } from "@/components";

// TODO: transition animations instead of loading spinner
export default function DashboardPage() {
  const data = useQuery(api.queries.getDashboardData, {});

  if (!data) {
    return <LoadingSpinner />;
  }

  return <Dashboard data={data} />;
}
