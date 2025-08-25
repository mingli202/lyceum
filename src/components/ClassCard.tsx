import { DashboardData } from "@convex/types";
import Link from "next/link";

export function ClassCard({
  classInfo,
}: {
  classInfo: DashboardData["classesInfo"][0];
}) {
  return (
    <Link
      href={`/class/${classInfo.classId}`}
      className="bg-background ring-foreground/10 z-0 flex flex-col rounded-lg p-3 text-sm shadow-md ring-1 transition hover:z-10 hover:cursor-pointer hover:shadow-lg"
    >
      <p className="w-fit rounded-full bg-indigo-100 px-1 py-0.5 text-xs text-indigo-800 ring-1 ring-indigo-300">
        {classInfo.code}
      </p>
      <p className="mt-2 font-bold">{classInfo.title}</p>
      <p>{classInfo.professor}</p>
      <hr className="border-foreground/20 my-2" />
      <div className="flex justify-between">
        <p>Grade</p>
        <p>{classInfo.grade}%</p>
      </div>
    </Link>
  );
}
