"use client";

import { RecordValues } from "@/types";
import { cn } from "@/utils/cn";
import { UserTask } from "@convex/types";
import { Calendar } from "lucide-react";

const TaskStatus = {
  Completed: "completed",
  Active: "active",
  Dropped: "dropped",
  OnHold: "onHold",
  New: "new",
} as const;

type TaskStatus = RecordValues<typeof TaskStatus>;

type TaskCardProps = {
  task: UserTask;
};
export function TaskCard({ task }: TaskCardProps) {
  return (
    <div className="bg-background ring-foreground/10 relative z-0 flex w-full flex-col gap-1 rounded-lg p-3 text-sm shadow-md ring-1 transition hover:z-10 hover:shadow-lg">
      <div className="flex justify-between gap-8">
        <p className="font-bold">{task.name}</p>
        <div className="flex">
          <p className="text-muted-foreground">{task.weight}%</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4" /> {task.dueDate}
      </div>
      <p className="text-muted-foreground whitespace-pre-wrap">
        {task.description}
      </p>
      <hr className="border-foreground/20 my-2" />
      <div className="flex justify-between">
        <p
          className={cn("rounded-full px-1.5 ring-1", {
            "bg-sky-200 text-sky-700 ring-sky-400":
              task.status === TaskStatus.Completed,
            "bg-yellow-200 text-yellow-700 ring-yellow-400":
              task.status === TaskStatus.Active,
            "ring-slatee-400 bg-slate-200 text-slate-700":
              task.status === TaskStatus.Dropped,
            "bg-amber-200 text-amber-700 ring-amber-400":
              task.status === TaskStatus.OnHold,
            "bg-green-200 text-green-700 ring-green-400":
              task.status === TaskStatus.New,
          })}
        >
          {task.status}
        </p>
        <div className="flex">
          {task.scoreObtained}/{task.scoreTotal}
        </div>
      </div>
    </div>
  );
}
