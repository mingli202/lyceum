import { Button, ButtonVariant, UserCard } from "@/components";
import { RecordValues } from "@/types";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { UserTask } from "@convex/types";
import { useQuery } from "convex/react";
import { Calendar, ClipboardList, MessageCircle, Users } from "lucide-react";
import { useState } from "react";

const Tab = {
  Tasks: "Tasks",
  Chat: "Chat",
  Students: "Students",
} as const;

type Tab = RecordValues<typeof Tab>;

export default function ClassTabs({ classId }: { classId: string }) {
  const [selectedTab, setSelectedTab] = useState<Tab>(Tab.Tasks);

  const tasks = useQuery(api.queries.getUserClassTasks, {
    classId: classId as Id<"classes">,
  });
  const students = useQuery(api.queries.getClassStudents, {
    classId: classId as Id<"classes">,
  });

  const iconMap: Record<Tab, React.ReactNode> = {
    [Tab.Tasks]: <ClipboardList className="h-4 w-4" />,
    [Tab.Chat]: <MessageCircle className="h-4 w-4" />,
    [Tab.Students]: <Users className="h-4 w-4" />,
  };

  return (
    <div className="relative flex basis-full flex-col gap-2">
      <div className="bg-background flex shrink-0 gap-2 rounded-[calc(0.25rem+0.25rem)] p-1 shadow-sm">
        <Button
          variant={
            selectedTab === Tab.Tasks ? ButtonVariant.Special : undefined
          }
          className="flex w-full items-center justify-center gap-2 p-1"
          key={Tab.Tasks}
          onClick={() => setSelectedTab(Tab.Tasks)}
        >
          {iconMap[Tab.Tasks]}
          <p className="hidden sm:block">
            {Tab.Tasks} ({tasks?.length})
          </p>
        </Button>
        <Button
          variant={selectedTab === Tab.Chat ? ButtonVariant.Special : undefined}
          className="flex w-full items-center justify-center gap-2 p-1"
          key={Tab.Chat}
          onClick={() => setSelectedTab(Tab.Chat)}
        >
          {iconMap[Tab.Chat]}
          <p className="hidden sm:block">{Tab.Chat}</p>
        </Button>
        <Button
          variant={
            selectedTab === Tab.Students ? ButtonVariant.Special : undefined
          }
          className="flex w-full items-center justify-center gap-2 p-1"
          key={Tab.Students}
          onClick={() => setSelectedTab(Tab.Students)}
        >
          {iconMap[Tab.Students]}
          <p className="hidden sm:block">
            {Tab.Students} ({students?.length})
          </p>
        </Button>
      </div>
      <div
        className="basis-full overflow-x-hidden overflow-y-auto p-1"
        style={{ scrollbarWidth: "thin" }}
      >
        {selectedTab === Tab.Tasks && (
          <div className="space-y-2">
            {tasks?.map((task) => (
              <TaskCard task={task} key={task._id} />
            ))}
          </div>
        )}
        {selectedTab === Tab.Chat && <p>Chat</p>}
        {selectedTab === Tab.Students && (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-2">
            {students?.map((student) => (
              <UserCard user={student} key={student.userId} />
            ))}
            <div className="col-span-full h-0" />
          </div>
        )}
      </div>
    </div>
  );
}

type TaskCardProps = {
  task: UserTask;
};
function TaskCard({ task }: TaskCardProps) {
  return (
    <div
      className="bg-background ring-foreground/10 z-0 flex w-full flex-col gap-1 rounded-lg p-3 text-sm shadow-md ring-1 transition hover:z-10 hover:cursor-pointer hover:shadow-lg"
      onClick={() => {}}
    >
      <div className="flex justify-between gap-4">
        <p>
          <span className="font-bold">{task.name}</span> ({task.weight}%)
        </p>
        <p>
          {task.scoreObtained}/{task.scoreTotal}
        </p>
      </div>
      <p className="flex items-center gap-2">
        <Calendar className="h-4 w-4" /> {task.dueDate}
      </p>
      <p className="text-muted-foreground">{task.description}</p>
    </div>
  );
}
