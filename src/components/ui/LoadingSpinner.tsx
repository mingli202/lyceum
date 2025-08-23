import { cn } from "@/utils/cn";
import { LoaderCircle } from "lucide-react";

// TODO: add better animations
// - enter and exit animations
type LoadingSpinnerProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & { hideLoadingText?: boolean };
export function LoadingSpinner({
  className,
  hideLoadingText,
  ...props
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-2",
        className,
      )}
      {...props}
    >
      <LoaderCircle className="h-10 w-10 animate-spin" />
      {!hideLoadingText && <p>Loading...</p>}
    </div>
  );
}
