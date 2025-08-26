import { LayoutDashboard } from "lucide-react";
import { DashboardData } from "@convex/types";
import AddClassDrawer from "./AddClassDrawer";
import { ClassCard } from "@/components";

type Props = {
  data: DashboardData;
};
export default function Dashboard({ data }: Props) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex shrink-0 flex-col gap-4 p-6">
        <div className="flex w-full items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-4xl font-bold text-blue-600">
              <LayoutDashboard className="h-9 w-9" />
              Dashboard
            </h1>
            <p>Your academic command center</p>
          </div>
          <AddClassDrawer />
        </div>

        <div className="text-background flex items-center justify-between rounded-lg border-2 border-solid border-indigo-300 bg-gradient-to-br from-blue-500 to-indigo-500 p-6 shadow-xl">
          <div>
            <h2 className="text-2xl font-bold">Your Academic Performance</h2>
            <p>Based on {data.classesInfo.length} class</p>
          </div>
          <div className="border-background/10 flex aspect-square flex-col items-center justify-center rounded-full border-2 border-solid p-4">
            {data.average?.toFixed(2) ?? "N/A"}
            <p className="text-sm">Average</p>
          </div>
        </div>
      </div>

      <div className="flex basis-full flex-col gap-1 overflow-hidden">
        <p className="col-span-full shrink-0 px-6">My classes</p>
        <div className="basis-full overflow-x-hidden overflow-y-auto px-6 pt-1 pb-6">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-2">
            {data.classesInfo.map((classInfo, i) => (
              <ClassCard classInfo={classInfo} key={classInfo.code + i} />
            ))}
            <div className="col-span-full h-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
