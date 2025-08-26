import { DashboardData } from "@convex/types";
import Link from "next/link";
import { Card, CardFooter, CardHeader, CardTitle } from "./ui/Card";

export function ClassCard({
  classInfo,
}: {
  classInfo: DashboardData["classesInfo"][0];
}) {
  return (
    <Link href={`/class?id=${classInfo.classId}`}>
      <Card clickable>
        <CardHeader>
          <p className="w-fit max-w-full truncate rounded-full bg-indigo-100 px-1 py-0.5 text-xs text-indigo-800 ring-1 ring-indigo-300">
            {classInfo.code}
          </p>
        </CardHeader>
        <div>
          <CardTitle>{classInfo.title}</CardTitle>
          <p>{classInfo.professor}</p>
        </div>
        <CardFooter className="flex justify-between">
          <p>Grade</p>
          <p>{classInfo.grade.toFixed(2)}%</p>
        </CardFooter>
      </Card>
    </Link>
  );
}
