import { DashboardData } from "@convex/types";
import Link from "next/link";
import { Card, CardFooter, CardHeader, CardTitle } from "../ui";

export function ClassCard({
  classInfo,
}: {
  classInfo: DashboardData["classesInfo"][0];
}) {
  return (
    <Link href={`/class?id=${classInfo.classId}`} className="h-full">
      <Card clickable className="h-full">
        <CardHeader className="shrink-0">
          <p className="w-fit max-w-full truncate rounded-full bg-indigo-100 px-1 py-0.5 text-xs text-indigo-800 ring-1 ring-indigo-300">
            {classInfo.code}
          </p>
        </CardHeader>
        <div className="shrink-0">
          <CardTitle>{classInfo.title}</CardTitle>
          <p>{classInfo.professor}</p>
        </div>
        <div className="basis-full" />
        <CardFooter className="flex shrink-0 justify-between">
          <p>Grade</p>
          <p>{classInfo.grade.toFixed(1)}%</p>
        </CardFooter>
      </Card>
    </Link>
  );
}
