import { LoaderCircle } from "lucide-react";

// TODO: add better animations
// - enter and exit animations
export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <LoaderCircle className="h-10 w-10 animate-spin" />
      <p>Loading</p>
    </div>
  );
}
