import { Button, ButtonVariant, TaskCard, TaskStatus } from "@/components";
import useFormState from "@/hooks/useFormState";
import { cn } from "@/utils/cn";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { UserTask } from "@convex/types";
import { useMutation } from "convex/react";
import { Plus, X } from "lucide-react";
import { Dialog } from "radix-ui";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

type TasksProps = {
  tasks?: UserTask[];
  classId: string;
};
export default function Tasks({ tasks, classId }: TasksProps) {
  const [editTask, setEditTask] = useState<
    Omit<UserTask, "_id" | "_creationTime" | "userId" | "userClassInfo"> &
      Partial<{
        _id: Id<"userTasks">;
        _creationTime: number;
        userId: Id<"users">;
        userClassInfo: Id<"userClassInfo">;
      }>
  >();

  const activeOrNewTasks: UserTask[] = [];
  const compltedTasks: UserTask[] = [];
  const droppedTasks: UserTask[] = [];
  const onHoldTasks: UserTask[] = [];

  if (tasks) {
    tasks.forEach((task) => {
      if (task.status === TaskStatus.Active || task.status === TaskStatus.New) {
        activeOrNewTasks.push(task);
      } else if (task.status === TaskStatus.Completed) {
        compltedTasks.push(task);
      } else if (task.status === TaskStatus.Dropped) {
        droppedTasks.push(task);
      } else if (task.status === TaskStatus.OnHold) {
        onHoldTasks.push(task);
      }
    });
  }

  return (
    <>
      <div className="space-y-2">
        <Button
          className="text-muted-foreground bg-background ring-foreground/10 hover:text-foreground z-0 flex w-full items-center justify-center gap-2 rounded-lg p-2 shadow-md ring-1 transition hover:z-10 hover:cursor-pointer hover:shadow-lg"
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
        </Button>
        {activeOrNewTasks.map((task) => (
          <TaskCard
            task={task}
            key={"active" + task._id}
            setEditTask={setEditTask}
          />
        ))}
        {compltedTasks.map((task) => (
          <TaskCard
            task={task}
            key={"rest" + task._id}
            setEditTask={setEditTask}
          />
        ))}
        {droppedTasks.map((task) => (
          <TaskCard
            task={task}
            key={"rest" + task._id}
            setEditTask={setEditTask}
          />
        ))}
        {onHoldTasks.map((task) => (
          <TaskCard
            task={task}
            key={"rest" + task._id}
            setEditTask={setEditTask}
          />
        ))}
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

type EditTaskProps = {
  task: Omit<UserTask, "_id" | "_creationTime" | "userId" | "userClassInfo"> &
    Partial<{
      _id: Id<"userTasks">;
      _creationTime: number;
      userId: Id<"users">;
      userClassInfo: Id<"userClassInfo">;
    }>;
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
function EditTask({ task, setEditTask: setShowEdit }: EditTaskProps) {
  const isNewTask = task._id === undefined;

  const updateTask = useMutation(api.mutations.updateTask);
  const createTask = useMutation(api.mutations.createTask);
  const deleteTask = useMutation(api.mutations.deleteTask);

  const nameRef = useRef<HTMLInputElement>(null!);
  const descriptionRef = useRef<HTMLTextAreaElement>(null!);
  const dueDateRef = useRef<HTMLInputElement>(null!);
  const weightRef = useRef<HTMLInputElement>(null!);
  const statusRef = useRef<HTMLSelectElement>(null!);
  const scoreObtainedRef = useRef<HTMLInputElement>(null!);
  const scoreTotalRef = useRef<HTMLInputElement>(null!);

  const [editTaskDetail, setEditTaskDetail] = useState<boolean>(isNewTask);

  useEffect(() => {
    nameRef.current!.value = task.name;
    descriptionRef.current!.value = task.description;
    dueDateRef.current!.value = task.dueDate;
    weightRef.current!.value = task.weight.toString();
    if (task.status === TaskStatus.New || task.status === TaskStatus.Active) {
      statusRef.current!.value = TaskStatus.Completed;
    } else {
      statusRef.current!.value = task.status;
    }

    scoreObtainedRef.current.value = task.scoreObtained.toString();
    scoreTotalRef.current.value = task.scoreTotal.toString();
  }, [task, editTaskDetail]);

  const [message, handleSubmit, isPending] = useFormState(async () => {
    const name = nameRef.current.value;
    const description = descriptionRef.current.value;
    const dueDate = dueDateRef.current.value;
    const weight = weightRef.current.value;
    const status = statusRef.current.value;
    const scoreObtained = scoreObtainedRef.current.value;
    const scoreTotal = scoreTotalRef.current.value;

    let res;
    if (!task._id) {
      res = await createTask({
        classId: task.classId,
        name,
        description,
        dueDate,
        weight: parseInt(weight),
        scoreObtained: parseInt(scoreObtained),
        scoreTotal: parseInt(scoreTotal),
      }).catch(() => "Error");
    } else {
      res = await updateTask({
        taskId: task._id,
        name: name && name !== task.name ? name : undefined,
        description:
          description && description !== task.description
            ? description
            : undefined,
        dueDate: dueDate && dueDate !== task.dueDate ? dueDate : undefined,
        weight:
          weight && parseInt(weight) !== task.weight
            ? parseInt(weight)
            : undefined,
        status:
          status && status !== task.status
            ? (status as UserTask["status"])
            : undefined,
        scoreObtained:
          scoreObtained && parseInt(scoreObtained) !== task.scoreObtained
            ? parseInt(scoreObtained)
            : undefined,
        scoreTotal:
          scoreTotal && parseInt(scoreTotal) !== task.scoreTotal
            ? parseInt(scoreTotal)
            : undefined,
      }).catch(() => "Error");
    }

    if (res) {
      return res;
    }
    setShowEdit(undefined);
  });

  return (
    <form
      className="bg-background ring-foreground/10 m-2 flex w-sm flex-col gap-1 space-y-2 rounded-lg p-3 text-sm shadow-md ring-1 transition hover:z-10 hover:shadow-lg"
      onSubmit={handleSubmit}
    >
      <Dialog.Title className="flex items-center justify-between gap-4 font-bold">
        <div className="flex w-full items-center justify-between gap-2">
          <p>Update Task</p>
          <Button
            className="p-0"
            onClick={() => {
              setShowEdit(undefined);
            }}
            type="button"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Dialog.Title>

      <div className={cn("flex flex-col gap-1", !editTaskDetail && "hidden")}>
        <label htmlFor="name">
          <p>Name</p>
          <input
            id="name"
            name="name"
            type="text"
            className={cn(
              "mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400",
            )}
            placeholder="e.g. Task name"
            ref={nameRef}
            required
          />
        </label>
        <label htmlFor="dueDate">
          <p>Due Date</p>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
            placeholder="e.g. 2023-01-01"
            ref={dueDateRef}
            required
          />
        </label>
        <div className="flex items-center gap-3">
          <label htmlFor="weight" className="w-full">
            <p>Weight (%)</p>
            <input
              id="weight"
              name="weight"
              type="number"
              className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
              placeholder="e.g. 30"
              ref={weightRef}
              required
              min={0}
              max={100}
            />
          </label>
          <label htmlFor="status" className="w-full">
            <p>Status</p>
            <select
              id="status"
              name="status"
              className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
              ref={statusRef}
              required
            >
              <option value={TaskStatus.Active}>Active</option>
              <option value={TaskStatus.Completed}>Completed</option>
              <option value={TaskStatus.Dropped}>Dropped</option>
              <option value={TaskStatus.New}>New</option>
              <option value={TaskStatus.OnHold}>On Hold</option>
            </select>
          </label>
        </div>
        <label htmlFor="description">
          <p>Description</p>
          <textarea
            id="description"
            rows={3}
            name="description"
            className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
            placeholder="e.g. Task description"
            ref={descriptionRef}
            required
          />
        </label>
      </div>

      <div className="flex w-full items-center gap-2">
        <label htmlFor="scoreObtained" className="w-full">
          <p>Score Obtained</p>
          <input
            id="scoreObtained"
            name="scoreObtained"
            type="number"
            className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
            placeholder="e.g. 100"
            ref={scoreObtainedRef}
            required
            min={0}
          />
        </label>
        /
        <label htmlFor="scoreTotal" className="w-full">
          <p>Total Score</p>
          <input
            id="scoreTotal"
            name="scoreTotal"
            type="number"
            className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
            placeholder="e.g. 100"
            ref={scoreTotalRef}
            required
            min={0}
          />
        </label>
      </div>
      <div className="flex w-full items-center justify-between gap-2">
        <Button
          type="button"
          onClick={() => {
            if (isPending) {
              return;
            }
            setEditTaskDetail((e) => !e);
          }}
          variant={ButtonVariant.Muted}
          disabled={isPending}
        >
          {editTaskDetail ? "Hide" : "Edit"} Details
        </Button>
        <div className="flex items-center justify-end gap-2">
          {!isNewTask ? (
            <Button
              variant="destructive"
              className="flex items-center justify-center"
              type="button"
              disabled={isPending}
              onClick={async () => {
                if (!task._id || isPending) {
                  return;
                }

                setShowEdit(undefined);
                await deleteTask({
                  taskId: task._id,
                });
              }}
            >
              Delete
            </Button>
          ) : null}
          <Button
            variant="special"
            type="submit"
            className="flex items-center justify-center"
            isPending={isPending}
          >
            {task._id ? "Update" : "Create"}
          </Button>
        </div>
      </div>
      {message && <p className="text-red-500">{message}</p>}
    </form>
  );
}
