import { TaskCard } from "@/components";
import { Card } from "@/components/ui/Card";
import { Id } from "@convex/_generated/dataModel";
import { UserTask } from "@convex/types";
import { Plus } from "lucide-react";
import { Dialog } from "radix-ui";
import { Fragment, useState } from "react";
import EditTask from "./EditTask";
import { TaskStatus, TaskType } from "@/types";

export type EditTaskType = Omit<
  UserTask,
  "_id" | "_creationTime" | "userId" | "userClassInfo"
> &
  Partial<{
    _id: Id<"userTasks">;
    _creationTime: number;
    userId: Id<"users">;
    userClassInfo: Id<"userClassInfo">;
  }>;

type TasksProps = {
  tasks?: UserTask[];
  classId: string;
};
export default function Tasks({ tasks, classId }: TasksProps) {
  const [editTask, setEditTask] = useState<EditTaskType>();

  const noClassTypeTasks: UserTask[] = [];
  const classTypeMap: Partial<{
    [k in TaskType]: {
      activeOrNew?: UserTask[];
      completed?: UserTask[];
      dropped?: UserTask[];
      other?: UserTask[];
    };
  }> = {
    [TaskType.Exam]: {},
    [TaskType.Assignments]: {},
    [TaskType.Project]: {},
    [TaskType.Quiz]: {},
    [TaskType.Other]: {},
  };

  if (tasks) {
    for (const task of tasks) {
      if (!task.type || task.type === TaskType.None) {
        noClassTypeTasks.push(task);
        continue;
      }

      if (!classTypeMap[task.type]) {
        classTypeMap[task.type] = {};
      }

      let key: "activeOrNew" | "completed" | "dropped" | "other";

      if (task.status === TaskStatus.Active || task.status === TaskStatus.New) {
        key = "activeOrNew";
      } else if (task.status === TaskStatus.Completed) {
        key = "completed";
      } else if (task.status === TaskStatus.Dropped) {
        key = "dropped";
      } else {
        key = "other";
      }

      if (!classTypeMap[task.type]![key]) {
        classTypeMap[task.type]![key] = [];
      }

      classTypeMap[task.type]![key]!.push(task);
    }
  }

  return (
    <>
      <div className="space-y-2">
        <Card
          className="text-muted-foreground flex-row items-center justify-center"
          clickable
          onClick={() =>
            setEditTask({
              classId: classId as Id<"classes">,
              name: "",
              description: "",
              dueDate: "",
              weight: 0,
              scoreObtained: 0,
              scoreTotal: 100,
              status: TaskStatus.New,
            })
          }
        >
          <Plus className="h-4 w-4" /> New Task
        </Card>
        {noClassTypeTasks.map((task) => (
          <TaskCard
            task={task}
            key={"active" + task._id}
            setEditTask={setEditTask}
          />
        ))}
        {Object.entries(classTypeMap).map(
          ([key, value]) =>
            Object.keys(value).length > 0 && (
              <Fragment key={key}>
                {key}
                <hr className="border-foreground/20" />
                {value.activeOrNew?.map((task) => (
                  <TaskCard
                    task={task}
                    key={"active" + task._id}
                    setEditTask={setEditTask}
                  />
                ))}
                {value.completed?.map((task) => (
                  <TaskCard
                    task={task}
                    key={"rest" + task._id}
                    setEditTask={setEditTask}
                  />
                ))}
                {value.dropped?.map((task) => (
                  <TaskCard
                    task={task}
                    key={"rest" + task._id}
                    setEditTask={setEditTask}
                  />
                ))}
                {value.other?.map((task) => (
                  <TaskCard
                    task={task}
                    key={"rest" + task._id}
                    setEditTask={setEditTask}
                  />
                ))}
              </Fragment>
            ),
        )}
      </div>

      <Dialog.Root
        open={!!editTask}
        onOpenChange={(open) => {
          if (!open) {
            setEditTask(undefined);
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="animate-pop-in fixed top-1/2 left-1/2 z-10 h-fit -translate-1/2">
            {editTask && <EditTask task={editTask} setEditTask={setEditTask} />}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
