import { Button, ButtonVariant } from "@/components";
import { cn } from "@/utils/cn";
import { api } from "@convex/_generated/api";
import { UserTask } from "@convex/types";
import { useMutation } from "convex/react";
import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import { Dispatch, SetStateAction, useRef, useState, useEffect } from "react";
import useFormState from "@/hooks/useFormState";
import { TaskStatus, TaskType } from "@/types";
import { EditTaskType } from "./Tasks";

type EditTaskProps = {
  task: EditTaskType;
  setEditTask: Dispatch<SetStateAction<EditTaskType | undefined>>;
};
export default function EditTask({
  task,
  setEditTask: setShowEdit,
}: EditTaskProps) {
  const isNewTask = task._id === undefined;

  const updateTask = useMutation(api.mutations.updateTask);
  const createTask = useMutation(api.mutations.createTask);
  const deleteTask = useMutation(api.mutations.deleteTask);

  const nameRef = useRef<HTMLInputElement>(null!);
  const descriptionRef = useRef<HTMLTextAreaElement>(null!);
  const dueDateRef = useRef<HTMLInputElement>(null!);
  const weightRef = useRef<HTMLInputElement>(null!);
  const statusRef = useRef<HTMLSelectElement>(null!);
  const typeRef = useRef<HTMLSelectElement>(null!);
  const scoreObtainedRef = useRef<HTMLInputElement>(null!);
  const scoreTotalRef = useRef<HTMLInputElement>(null!);

  const [editTaskDetail, setEditTaskDetail] = useState<boolean>(isNewTask);

  useEffect(() => {
    nameRef.current!.value = task.name;
    descriptionRef.current!.value = task.description;
    dueDateRef.current!.value = task.dueDate;
    weightRef.current!.value = task.weight.toString();
    typeRef.current!.value = task.type ?? TaskType.None;

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
    const type = typeRef.current.value;
    const scoreObtained = scoreObtainedRef.current.value;
    const scoreTotal = scoreTotalRef.current.value;

    let res;
    if (!task._id) {
      res = await createTask({
        classId: task.classId,
        name,
        description,
        dueDate,
        weight: Number(weight),
        scoreObtained: Number(scoreObtained),
        scoreTotal: Number(scoreTotal),
        type: type as UserTask["type"],
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
          weight && Number(weight) !== task.weight ? Number(weight) : undefined,
        status:
          status && status !== task.status
            ? (status as UserTask["status"])
            : undefined,
        scoreObtained:
          scoreObtained && Number(scoreObtained) !== task.scoreObtained
            ? Number(scoreObtained)
            : undefined,
        scoreTotal:
          scoreTotal && Number(scoreTotal) !== task.scoreTotal
            ? Number(scoreTotal)
            : undefined,
        type: type === task.type ? undefined : (type as UserTask["type"]),
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
        <div className="flex items-center gap-3">
          <label htmlFor="dueDate" className="w-full">
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

          <label htmlFor="weight" className="w-full">
            <p>Weight (%)</p>
            <input
              id="weight"
              name="weight"
              type="number"
              className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
              placeholder="e.g. 30"
              ref={weightRef}
              step="any"
              required
            />
          </label>
        </div>
        <div className="flex items-center gap-3">
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
          <label htmlFor="type" className="w-full">
            <p>Type</p>
            <select
              id="type"
              name="type"
              className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
              ref={typeRef}
              required
            >
              <option value={TaskType.None}>{TaskType.None}</option>
              <option value={TaskType.Exam}>{TaskType.Exam}</option>
              <option value={TaskType.Assignment}>{TaskType.Assignment}</option>
              <option value={TaskType.Project}>{TaskType.Project}</option>
              <option value={TaskType.Quiz}>{TaskType.Quiz}</option>
              <option value={TaskType.Other}>{TaskType.Other}</option>
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
            autoFocus
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
          disabled={isPending || isNewTask}
          className={cn(
            isNewTask && "bg-muted-foreground/10 cursor-not-allowed",
          )}
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
