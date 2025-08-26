"use client";

import { Button, ButtonVariant } from "@/components";
import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";
import { ArrowLeft, Edit, Target, TrendingUp, X } from "lucide-react";
import { useRouter } from "next/navigation";
import ClassTabs from "./ClassTabs";
import { Id } from "@convex/_generated/dataModel";
import { useState } from "react";
import { ClassPageData } from "@convex/types";

type ClassProps = {
  classData: ClassPageData;
};

export default function Class({ classData }: ClassProps) {
  const deleteClass = useMutation(api.mutations.deleteClass);
  const router = useRouter();
  const [isEditingTargetGrade, setIsEditingTargetGrade] = useState(false);
  const editTargetGrade = useMutation(api.mutations.editTargetGrade);

  return (
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
                {classData.code} · {classData.professor}
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
            <div className="bg-background ring-foreground/10 h-fit w-full rounded-lg p-2 shadow-md ring-1">
              <div className="flex items-center justify-between">
                <h3 className="truncate text-base">Current Grade</h3>
                <TrendingUp className="h-4 w-4 flex-shrink-0 text-blue-500" />
              </div>

              <div className="font-bold break-words text-slate-800">
                {classData.grade.toFixed(2)}%
              </div>
              <p className="text-muted-foreground text-sm">
                Overall performance
              </p>
            </div>

            <div className="bg-background h-fit w-full rounded-lg p-2 shadow-md ring-1 ring-green-300">
              <div className="flex items-center justify-between">
                <h3 className="truncate text-base text-gray-900">
                  Target Grade
                </h3>
                {isEditingTargetGrade ? (
                  <X
                    className="h-4 w-4 flex-shrink-0 text-green-500 hover:cursor-pointer"
                    onClick={() => setIsEditingTargetGrade(false)}
                  />
                ) : (
                  <Edit
                    className="h-4 w-4 flex-shrink-0 text-green-500 hover:cursor-pointer"
                    onClick={() => setIsEditingTargetGrade(true)}
                  />
                )}
              </div>

              {isEditingTargetGrade ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const targetGrade = parseInt(
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
                  <input
                    type="number"
                    id="targetGrade"
                    name="targetGrade"
                    defaultValue={classData.targetGrade}
                    placeholder="85"
                    className="w-15 outline-none"
                    min={0}
                    max={100}
                  />
                  %
                </form>
              ) : (
                <div className="font-bold break-words text-green-700">
                  {classData.targetGrade}%
                </div>
              )}
              <p className="text-muted-foreground text-sm">
                Your goal for this class
              </p>
            </div>

            <div className="bg-background h-fit w-full rounded-lg p-2 shadow-md ring-1 ring-blue-300">
              <div className="flex items-center justify-between">
                <h3 className="truncate text-base text-gray-900">
                  Required Grade
                </h3>
                <Target className="h-4 w-4 flex-shrink-0 text-blue-500" />
              </div>

              <div className="font-bold break-words text-blue-700">
                {classData.remainingGrade.toFixed(2)}%
              </div>
              <p className="text-muted-foreground text-sm">
                Needed to the remaining tasks
              </p>
            </div>
          </div>
          <ClassTabs classId={classData.classId} />
        </div>
      </div>
    </section>
  );
}
