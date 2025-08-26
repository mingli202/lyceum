"use client";

import { useSearchParams } from "next/navigation";
import Class from "./Class";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { LoadingSpinner } from "@/components";

export default function ClassPage() {
  const params = useSearchParams();

  const classId = params.get("id")?.toString();
  const classData = useQuery(api.queries.getClassPageData, { classId });

  if (!classData) {
    return <LoadingSpinner />;
  }

  if (typeof classData === "string") {
    return (
      <div className="flex h-full w-full items-center justify-center text-red-500">
        {classData}
      </div>
    );
  }

  return <Class classData={classData} />;
}
