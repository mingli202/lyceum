import { Button, LoadingSpinner } from "@/components/ui";
import { Archive, FileUp, Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { Drawer } from "vaul";

export default function AddClassModal() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | undefined>();
  const [isManual, setIsManual] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="flex gap-4">
      {/* TODO: button actions */}
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
          <Drawer.Content className="fixed top-0 right-0 flex h-fit w-full justify-center p-2 md:h-full md:w-fit">
            <form
              className="bg-background flex flex-col gap-4 rounded-lg p-4 md:w-sm"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="flex items-center justify-between">
                <Drawer.Title className="font-bold">New class</Drawer.Title>
                <Drawer.Close
                  asChild
                  onClick={() => {
                    setFile(undefined);
                    setIsManual(false);
                  }}
                >
                  <Button className="p-0" type="button">
                    <X />
                  </Button>
                </Drawer.Close>
              </div>
              {!isManual ? (
                <div className="flex flex-col gap-1">
                  <p>From Syllabus</p>
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
                <div className="flex flex-col gap-2">
                  <label htmlFor="class-name">
                    <p>Class Name*</p>
                    <input
                      id="class-name"
                      name="class-name"
                      type="text"
                      className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
                      placeholder="e.g. Cryptography"
                      required
                    />
                  </label>
                </div>
              )}
              <Button variant="special">Submit</Button>
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
