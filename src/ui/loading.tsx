import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <LoaderCircle className="h-10 w-10 animate-spin" />
    </div>
  );
}
