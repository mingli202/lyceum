"use client";

import { useParams } from "next/navigation";
import Class from "./Class";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { LoadingSpinner } from "@/components";

export default function ClassPage() {
  const params = useParams();

  const classId = params.classId?.toString();
  const classData = classId
    ? useQuery(api.queries.getClassPageData, { classId })
    : "Class not found";

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
