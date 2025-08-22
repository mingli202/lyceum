"use client";

import { useQuery } from "convex/react";
import Dashboard from "./Dashboard";
import { LoadingSpinner } from "@/components/ui";
import { api } from "../../../../convex/_generated/api";
import { DashboardData } from "../../../../convex/queries";
import { Id } from "../../../../convex/_generated/dataModel";

const placeHolderData: DashboardData = {
  classesInfo: [
    {
      code: "CSCI-101",
      title: "Introduction to Computer Science",
      professor: "Dr. John Doe",
      _id: "62e9c8d8c3a2a1d3c0a9" as Id<"classes">,
      grade: 80,
    },
    {
      code: "CSCI-101",
      title: "Introduction to Computer Science",
      professor: "Dr. John Doe",
      _id: "62e9c8d8c3a2a1d3c0a9" as Id<"classes">,
      grade: 80,
    },
    {
      code: "CSCI-101",
      title: "Introduction to Computer Science",
      professor: "Dr. John Doe",
      _id: "62e9c8d8c3a2a1d3c0a9" as Id<"classes">,
      grade: 80,
    },
    {
      code: "CSCI-101",
      title: "Introduction to Computer Science",
      professor: "Dr. John Doe",
      _id: "62e9c8d8c3a2a1d3c0a9" as Id<"classes">,
      grade: 80,
    },
    {
      code: "CSCI-101",
      title: "Introduction to Computer Science",
      professor: "Dr. John Doe",
      _id: "62e9c8d8c3a2a1d3c0a9" as Id<"classes">,
      grade: 80,
    },
    {
      code: "CSCI-101",
      title: "Introduction to Computer Science",
      professor: "Dr. John Doe",
      _id: "62e9c8d8c3a2a1d3c0a9" as Id<"classes">,
      grade: 80,
    },
    {
      code: "CSCI-101",
      title: "Introduction to Computer Science",
      professor: "Dr. John Doe",
      _id: "62e9c8d8c3a2a1d3c0a9" as Id<"classes">,
      grade: 80,
    },
    {
      code: "CSCI-101",
      title: "Introduction to Computer Science",
      professor: "Dr. John Doe",
      _id: "62e9c8d8c3a2a1d3c0a9" as Id<"classes">,
      grade: 80,
    },
    {
      code: "CSCI-101",
      title: "Introduction to Computer Science",
      professor: "Dr. John Doe",
      _id: "62e9c8d8c3a2a1d3c0a9" as Id<"classes">,
      grade: 80,
    },
  ],
};

// TODO: transition animations instead of loading spinner
export default function DashboardPage() {
  const data = useQuery(api.queries.getDashboardData, {});

  if (!data) {
    return <LoadingSpinner />;
  }

  return <Dashboard data={placeHolderData} />;
}
