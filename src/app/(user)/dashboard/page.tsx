"use client";

import { useQuery } from "convex/react";
import Dashboard from "./Dashboard";
import { LoadingSpinner } from "@/components/ui";
import { api } from "../../../../convex/_generated/api";

// TODO: transition animations instead of loading spinner
export default function DashboardPage() {
  const data = useQuery(api.queries.getDashboardData, {});

  if (!data) {
    return <LoadingSpinner />;
  }

  return <Dashboard data={data} />;
}
