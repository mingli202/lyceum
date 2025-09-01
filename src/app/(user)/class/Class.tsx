"use client";

import { Button, ButtonVariant } from "@/components";
import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";
import { ArrowLeft, Target, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import ClassTabs from "./ClassTabs";
import { Id } from "@convex/_generated/dataModel";
import { useState } from "react";
import { ClassPageData } from "@convex/types";
import { Dialog } from "radix-ui";
import { Card } from "@/components/ui/Card";

type ClassProps = {
  classData: ClassPageData;
};

export default function Class({ classData }: ClassProps) {
  const deleteClass = useMutation(api.mutations.deleteClass);
  const router = useRouter();
  const [isEditingTargetGrade, setIsEditingTargetGrade] = useState(false);
  const editTargetGrade = useMutation(api.mutations.editTargetGrade);

  return (
    <>
      <section className="flex h-full w-full justify-center">
        <div className="relative flex h-full w-full max-w-4xl flex-col">
          <div className="flex flex-col gap-4 px-6 pt-6">
            <Button
              className="text-muted-foreground flex items-center gap-2 p-0"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" /> back
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{classData.title}</h1>
                <p className="text-muted-foreground">
                  {classData.school} · {classData.code} · {classData.professor}
                </p>
              </div>
              <Button
                variant={ButtonVariant.Destructive}
                className="h-fit"
                onClick={async () => {
                  router.push("/dashboard");
                  await deleteClass({
                    classId: classData.classId as Id<"classes">,
                  });
                }}
              >
                Delete
              </Button>
            </div>
          </div>

          <div className="flex basis-full gap-3 overflow-hidden px-6 pt-6 pb-4">
            <div className="flex w-xs flex-1 flex-col gap-2">
              <Card className="w-full gap-1 text-base">
                <div className="flex items-center justify-between">
                  <h3 className="truncate">Current Grade</h3>
                  <TrendingUp className="h-4 w-4 flex-shrink-0 text-blue-500" />
                </div>

                <div className="font-bold text-slate-800">
                  {classData.grade.toFixed(1)}%
                </div>
                <p className="text-muted-foreground text-sm">
                  Overall performance
                </p>
              </Card>

              <Card className="w-full gap-1 text-base shadow-amber-500/30 ring-amber-300">
                <div className="flex items-center justify-between">
                  <h3 className="truncate text-base text-gray-900">
                    Required Grade
                  </h3>
                  <TrendingUp className="h-4 w-4 flex-shrink-0 text-amber-500" />
                </div>

                <div className="font-bold text-amber-700">
                  {classData.remainingGrade.toFixed(1)}%
                </div>
                <p className="text-muted-foreground text-sm">
                  Needed to the remaining tasks
                </p>
              </Card>

              <Card className="w-full gap-1 text-base shadow-blue-500/30 ring-blue-300">
                <div className="flex items-center justify-between">
                  <h3 className="truncate text-base text-gray-900">
                    Target Grade
                  </h3>
                  <Target className="h-4 w-4 flex-shrink-0 text-blue-500 hover:cursor-pointer" />
                </div>

                <div className="font-bold break-words text-blue-700">
                  {classData.targetGrade}%
                </div>
                <p className="text-muted-foreground text-sm">
                  Your goal for this class
                </p>
              </Card>

              <button
                onClick={() => setIsEditingTargetGrade(true)}
                className="w-full"
              >
                <Card
                  clickable
                  className="w-full flex-row items-center justify-center gap-1 text-sm text-blue-800 shadow-blue-500/30 ring-blue-300"
                >
                  <Target className="h-4 w-4" />
                  Edit target grade
                </Card>
              </button>
            </div>
            <ClassTabs classId={classData.classId} chatId={classData.chatId} />
          </div>
        </div>
      </section>

      <Dialog.Root
        open={isEditingTargetGrade}
        onOpenChange={setIsEditingTargetGrade}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="animate-pop-in fixed top-1/2 left-1/2 z-10 h-fit -translate-1/2">
            <form
              className="bg-background flex w-sm flex-col gap-3 rounded-lg p-5"
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const targetGrade = Number(
                  formData.get("targetGrade")?.toString() ??
                    classData.targetGrade.toString(),
                );

                if (targetGrade === classData.targetGrade) {
                  return;
                }

                setIsEditingTargetGrade(false);
                await editTargetGrade({
                  classId: classData.classId as Id<"classes">,
                  targetGrade: targetGrade,
                });
              }}
            >
              <Dialog.Title className="flex items-center justify-between gap-4 font-bold">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Edit target grade (%)
                </div>
              </Dialog.Title>
              <input
                id="targetGrade"
                name="targetGrade"
                type="number"
                className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
                placeholder="e.g. 85"
                required
                min={0}
                max={100}
                defaultValue={classData.targetGrade}
              />
              <p className="text-muted-foreground text-sm">
                Set your personal target grade for this class (0-100%).
              </p>
              <div className="flex w-full items-center justify-end gap-2">
                <Button
                  type="button"
                  className="flex w-fit items-center justify-center"
                  onClick={() => setIsEditingTargetGrade(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="special"
                  type="submit"
                  className="flex w-fit items-center justify-center"
                >
                  Update
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
