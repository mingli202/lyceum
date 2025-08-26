"use client";

import { RecordValues } from "@/types";
import { cn } from "@/utils/cn";
import { Id } from "@convex/_generated/dataModel";
import { UserTask } from "@convex/types";
import { Calendar, Edit, Trash } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { Card } from "./ui/Card";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";

export const TaskStatus = {
  Completed: "completed",
  Active: "active",
  Dropped: "dropped",
  OnHold: "on hold",
  New: "new",
} as const;

export type TaskStatus = RecordValues<typeof TaskStatus>;

type TaskCardProps = {
  task: UserTask;
  setEditTask: Dispatch<
    SetStateAction<
      | (Omit<UserTask, "_id" | "_creationTime" | "userId" | "userClassInfo"> &
          Partial<{
            _id: Id<"userTasks">;
            _creationTime: number;
            userId: Id<"users">;
            userClassInfo: Id<"userClassInfo">;
          }>)
      | undefined
    >
  >;
};
export function TaskCard({ task, setEditTask }: TaskCardProps) {
  const deleteTask = useMutation(api.mutations.deleteTask);

  return (
    <Card
      clickable
      onClick={() => {
        setEditTask((t) => {
          return t?._id === task._id ? undefined : task;
        });
      }}
    >
      <div className="flex items-center justify-between gap-8">
        <p className="font-bold">{task.name}</p>
        <div className="text-muted-foreground flex items-center gap-2">
          <Edit className="h-4 w-4" />
          <Trash
            className="h-4 w-4 text-red-400"
            onClick={async (e) => {
              e.stopPropagation();
              await deleteTask({ taskId: task._id as Id<"userTasks"> });
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" /> {task.dueDate}
        </div>
        <p
          className={cn("rounded-full px-1.5 ring-1", {
            "bg-sky-200 text-sky-700 ring-sky-400":
              task.status === TaskStatus.Completed,
            "bg-yellow-200 text-yellow-700 ring-yellow-400":
              task.status === TaskStatus.Active,
            "ring-slatee-400 bg-slate-200 text-slate-700":
              task.status === TaskStatus.Dropped,
            "bg-rose-200 text-rose-700 ring-rose-400":
              task.status === TaskStatus.OnHold,
            "bg-green-200 text-green-700 ring-green-400":
              task.status === TaskStatus.New,
          })}
        >
          {task.status}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex">
          {task.scoreObtained}/{task.scoreTotal} (
          {((task.scoreObtained * 100) / task.scoreTotal).toFixed(1)}%)
        </div>
        <div>
          <p className="text-muted-foreground">Weight: {task.weight}%</p>
        </div>
      </div>
    </Card>
  );
}
