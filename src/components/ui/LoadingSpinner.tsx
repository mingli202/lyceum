import { cn } from "@/utils/cn";
import { LoaderCircle } from "lucide-react";

// TODO: add better animations
// - enter and exit animations
type LoadingSpinnerProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
>;
export function LoadingSpinner({ className, ...props }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "w-ful flex h-full flex-col items-center justify-center gap-2",
      )}
      {...props}
    >
      <LoaderCircle className="h-10 w-10 animate-spin" />
      <p>Loading</p>
    </div>
  );
}
