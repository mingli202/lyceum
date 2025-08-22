import Button from "@/components/ui/Button";
import { Archive, LayoutDashboard, Plus } from "lucide-react";
import { DashboardData } from "../../../../convex/queries";
import Link from "next/link";

type Props = {
  data: DashboardData;
};
export default function Dashboard({ data }: Props) {
  return (
    <div className="flex h-full w-full flex-col gap-4 overflow-hidden p-6">
      {/* Header */}
      <div className="flex w-full items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-4xl font-bold text-blue-600">
            <LayoutDashboard className="h-9 w-9" />
            Dashboard
          </h1>
          <p>Your academic command center</p>
        </div>
        <div className="flex gap-4">
          {/* TODO: button actions */}
          <Button className="flex items-center gap-1 text-sm">
            <Archive className="h-3.5 w-3.5" />
            Archives
          </Button>
          <Button className="flex items-center gap-1 text-sm" variant="special">
            <Plus className="h-3.5 w-3.5" />
            Add New Class
          </Button>
        </div>
      </div>

      <div className="text-background flex items-center justify-between rounded-lg border-2 border-solid border-indigo-300 bg-gradient-to-br from-blue-500 to-indigo-500 p-6 shadow-xl">
        <div>
          <h2 className="text-2xl font-bold">Your Academic Performance</h2>
          <p>Based on {data.classesInfo.length} class</p>
        </div>
        <div className="border-background/10 flex aspect-square flex-col items-center justify-center rounded-full border-2 border-solid p-4">
          {data.average ?? "N/A"}
          <p className="text-sm">Average</p>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-2">
        <p className="col-span-full">My classes</p>
        {data.classesInfo.map((classInfo, i) => (
          <ClassCard classInfo={classInfo} key={classInfo.code + i} />
        ))}
      </div>
    </div>
  );
}

function ClassCard({
  classInfo,
}: {
  classInfo: DashboardData["classesInfo"][0];
}) {
  return (
    <Link
      href={`/class/${classInfo._id}`}
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
