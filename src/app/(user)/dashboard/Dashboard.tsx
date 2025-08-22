import Button from "@/components/ui/Button";
import { Archive, LayoutDashboard, Plus } from "lucide-react";
import { DashboardData } from "../../../../convex/queries";

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
    </div>
  );
}

function ClassCard({
  classInfo,
}: {
  classInfo: DashboardData["classesInfo"][0];
}) {
  return (
    <div className="bg-background/10 flex flex-col gap-2 rounded-lg p-4">
      <div className="flex items-center gap-2">
        <div className="bg-background/10 h-9 w-9 rounded-full p-1">
          <p className="text-foreground text-xl font-bold">{classInfo.code}</p>
        </div>
        <p className="text-xl font-bold">{classInfo.title}</p>
      </div>
      <p className="text-foreground/50 text-sm">{classInfo.professor}</p>
    </div>
  );
}
