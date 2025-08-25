"use client";

import { UserTask } from "@convex/types";
import { Calendar } from "lucide-react";

type TaskCardProps = {
  task: UserTask;
};
export function TaskCard({ task }: TaskCardProps) {
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
