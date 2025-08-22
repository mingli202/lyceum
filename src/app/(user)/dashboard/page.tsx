"use client";

import { useQuery } from "convex/react";
import Dashboard from "./Dashboard";
import { LoadingSpinner } from "@/components/ui";
import { api } from "../../../../convex/_generated/api";

export default function DashboardPage() {
  const classes = useQuery(api.queries.getDashboardData, {});

  if (!classes) {
    return <LoadingSpinner />;
  }

  return <Dashboard data={classes} />;
}
