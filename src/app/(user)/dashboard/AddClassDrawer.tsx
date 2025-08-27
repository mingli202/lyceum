import parseSyllabus from "./parseSyllabus";
import { Button, LoadingSpinner } from "@/components";
import { Archive, FileUp, Minus, Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Drawer } from "vaul";
import schema from "@convex/schema";
import useFormState from "@/hooks/useFormState";
import checkForOverlap from "./checkForOverlap";
import { AddClassArgs } from "@convex/types";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";

type ClassTime =
  (typeof schema.tables.classes.validator.fields.classTimes.type)[0];

export default function AddClassDrawer() {
  const addClass = useMutation(api.mutations.addClass);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const [file, setFile] = useState<File | undefined>();
  const [isManual, setIsManual] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [classTimes, setClassTimes] = useState<ClassTime[]>([]);
  const [timeS, setTimeS] = useState(0);

  const intervalId = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };
  }, []);

  const [error, handleSubmit, isPending] = useFormState(async (e) => {
    let body: AddClassArgs;

    if (isManual) {
      const formData = new FormData(e.currentTarget);

      const title = formData.get("class-title")!.toString();
      const code = formData.get("class-code")!.toString();
      const professor = formData.get("class-prof")!.toString();
      const semester = formData.get("class-semester")!.toString();
      const year = formData.get("class-year")!.toString();
      const credits = formData.get("class-credits")!.toString();
      const targetGrade = formData.get("class-target-grade")!.toString();

      if (!["Summer", "Fall", "Winter"].includes(semester)) {
        return "Invalid semester";
      }

      body = {
        code,
        title,
        professor,
        semester: semester as AddClassArgs["semester"],
        year: parseInt(year),
        credits: parseInt(credits),
        classTimes,
        targetGrade: parseInt(targetGrade),
        tasks: [],
      };
    } else {
      if (!file) {
        return "Please upload a syllabus";
      }

      intervalId.current = setInterval(() => {
        setTimeS((s) => s + 0.1);
      }, 100);
      body = await parseSyllabus(file);
    }

    try {
      if (checkForOverlap(body.classTimes)) {
        body.classTimes = [];
      }
    } catch (e) {
      if (isManual) {
        if (e instanceof Error) {
          return e.message;
        }
        return "Error while checking for class times overlap";
      }
    }

    const res = await addClass(body);

    if (res && res !== "ok") {
      return res;
    } else {
      closeButtonRef.current?.click();
    }
  });

  return (
    <div className="flex gap-4">
      <Button className="flex items-center gap-1 text-sm">
        <Archive className="h-3.5 w-3.5" />
        Archives
      </Button>
      <Drawer.Root direction="right">
        <Drawer.Trigger asChild>
          <Button className="flex items-center gap-1 text-sm" variant="special">
            <Plus className="h-3.5 w-3.5" />
            Add New Class
          </Button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40" />
          <Drawer.Content className="fixed right-0 bottom-0 flex h-fit w-full justify-center p-2 md:top-0 md:h-full md:w-fit">
            <form
              className="bg-background flex w-full flex-col gap-4 rounded-lg p-4 md:w-sm"
              ref={formRef}
              onSubmit={handleSubmit}
            >
              <div className="flex items-center justify-between">
                <Drawer.Title className="font-bold">New class</Drawer.Title>
                <Drawer.Close
                  ref={closeButtonRef}
                  asChild
                  onClick={() => {
                    setFile(undefined);
                    formRef.current?.reset();
                    setClassTimes([]);
                  }}
                >
                  <Button className="p-0" type="button">
                    <X />
                  </Button>
                </Drawer.Close>
              </div>
              {!isManual ? (
                <div className="flex flex-col gap-1">
                  <p>From Syllabus (ChatGPT)</p>
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center gap-2 rounded-md border-2 border-dashed border-indigo-300 p-4 transition hover:cursor-pointer hover:border-indigo-500"
                    onClick={() => {
                      setIsUploading(true);

                      // why is there no event listener for cancel?
                      const f = () => setIsUploading(false);
                      fileInputRef.current?.addEventListener("cancel", f, {
                        once: true,
                      });
                      fileInputRef.current?.removeEventListener("change", f);
                    }}
                  >
                    {isUploading ? (
                      <LoadingSpinner hideLoadingText />
                    ) : (
                      <>
                        <FileUp className="shrink-0" />
                        {file ? (
                          <p className="truncate">{file.name}</p>
                        ) : (
                          <p>Upload PDF</p>
                        )}
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="file-upload"
                      name="file-upload"
                      onChange={(e) => {
                        setFile(e.target.files?.[0]);
                        setIsUploading(false);
                      }}
                      accept=".pdf"
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <label htmlFor="class-title">
                    <p>Class Title*</p>
                    <input
                      id="class-title"
                      name="class-title"
                      type="text"
                      className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
                      placeholder="e.g. Cryptography"
                      required
                    />
                  </label>
                  <label htmlFor="class-code">
                    <p>Class Code*</p>
                    <input
                      id="class-code"
                      name="class-code"
                      type="text"
                      className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
                      placeholder="e.g. COMP 547"
                      required
                    />
                  </label>
                  <label htmlFor="class-prof">
                    <p>Professor*</p>
                    <input
                      id="class-prof"
                      name="class-prof"
                      type="text"
                      className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
                      placeholder="e.g. Dr. John Doe"
                      required
                    />
                  </label>
                  <div className="flex w-full items-center gap-3">
                    <label htmlFor="class-semester" className="w-full">
                      <p>Semester*</p>
                      <select
                        id="class-semester"
                        name="class-semester"
                        className="mt-1 h-8 w-full rounded px-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
                        required
                      >
                        <option value="Summer">Summer</option>
                        <option value="Fall">Fall</option>
                        <option value="Winter">Winter</option>
                      </select>
                    </label>
                    <label htmlFor="class-year" className="w-full">
                      <p>Year*</p>
                      <input
                        id="class-year"
                        name="class-year"
                        type="number"
                        className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
                        required
                        defaultValue={new Date().getFullYear()}
                      />
                    </label>
                  </div>

                  <div className="flex w-full items-center gap-3">
                    <label htmlFor="class-target-grade" className="w-full">
                      <p>Target Grade</p>
                      <input
                        id="class-target-grade"
                        name="class-target-grade"
                        type="number"
                        className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
                        required
                        defaultValue={85}
                        min={0}
                        max={100}
                      />
                    </label>
                    <label htmlFor="class-credits" className="w-full">
                      <p>Credits</p>
                      <input
                        id="class-credits"
                        name="class-credits"
                        type="number"
                        className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
                        required
                        defaultValue={3}
                        min={0}
                      />
                    </label>
                  </div>

                  <div className="flex w-full flex-col items-center gap-1">
                    <div className="flex w-full justify-between">
                      <p>Class Times</p>
                      <Button
                        className="shrink-0 p-0"
                        onClick={() => {
                          setClassTimes((prev) => [
                            ...prev,
                            {
                              day: "Monday",
                              start: "09:00",
                              end: "10:00",
                            },
                          ]);
                        }}
                        type="button"
                      >
                        <Plus />
                      </Button>
                    </div>
                    {classTimes.length > 0 && (
                      <div className="flex w-full flex-col gap-2">
                        {classTimes.map((t, i) => (
                          <ClassTimeInput
                            key={i}
                            classTime={t}
                            onRemove={() => {
                              setClassTimes((prev) =>
                                prev.filter((_, k) => k !== i),
                              );
                            }}
                            onChange={(classTime) => {
                              setClassTimes((prev) => {
                                const newClassTimes = [...prev];
                                newClassTimes[i] = classTime;
                                return newClassTimes;
                              });
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <Button
                variant="special"
                isPending={isPending}
                pendingElement={
                  isManual ? undefined : <p>{timeS.toFixed(1)} s</p>
                }
              >
                Submit
              </Button>
              {error && <p className="text-red-500">{error}</p>}
              <Button
                className="p-0"
                onClick={() => {
                  setIsManual(!isManual);
                }}
                type="button"
              >
                {isManual ? "From Syllabus" : "Manual Input"}
              </Button>
            </form>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}

type ClassTimeInputProps = {
  classTime: ClassTime;
  onRemove: () => void;
  onChange: (classTime: ClassTime) => void;
};

function ClassTimeInput({
  classTime,
  onRemove,
  onChange,
}: ClassTimeInputProps) {
  return (
    <div className="flex w-full gap-1 rounded p-1 ring-2 ring-indigo-200">
      <select
        id="class-day"
        name="class-day"
        className="outline-none"
        required
        value={classTime.day}
        onChange={(e) => {
          onChange({
            ...classTime,
            day: e.target.value as ClassTime["day"],
          });
        }}
      >
        <option value="Monday">Mon</option>
        <option value="Tuesday">Tue</option>
        <option value="Wednesday">Wed</option>
        <option value="Thursday">Thu</option>
        <option value="Friday">Fri</option>
        <option value="Saturday">Sat</option>
        <option value="Sunday">Sun</option>
      </select>
      <input
        id="class-start"
        name="class-start"
        type="time"
        className="w-fit outline-none"
        required
        defaultValue="09:00"
        onChange={(e) => {
          onChange({
            ...classTime,
            start: e.target.value,
          });
        }}
      />
      <p className="flex items-center">-</p>
      <input
        id="class-end"
        name="class-end"
        type="time"
        className="w-fit outline-none"
        required
        defaultValue="10:00"
        onChange={(e) => {
          onChange({
            ...classTime,
            end: e.target.value,
          });
        }}
      />
      <div className="basis-full" />
      <Button type="button" className="shrink-0 p-0" onClick={() => onRemove()}>
        <Minus />
      </Button>
    </div>
  );
}
