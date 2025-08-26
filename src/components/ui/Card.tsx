import { cn } from "@/utils/cn";
import { HTMLAttributes, ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  isClickable?: boolean;
} & HTMLAttributes<HTMLDivElement>;
export function Card({
  children,
  isClickable,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-background ring-foreground/10 z-0 flex items-center gap-2 rounded-lg p-3 text-sm shadow-md ring-1",
        isClickable &&
          "transition hover:z-10 hover:cursor-pointer hover:shadow-lg",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

type CardHeaderProps = {
  children: ReactNode;
};
export function CardHeader({ children }: CardHeaderProps) {
  return (
    <div className="w-fit rounded-full bg-indigo-100 px-1 py-0.5 text-xs text-indigo-800 ring-1 ring-indigo-300">
      {children}
    </div>
  );
}
export function CardTitle({ children }: { children: ReactNode }) {}
export function CardContent({ children }: { children: ReactNode }) {}
export function CardFooter({ children }: { children: ReactNode }) {}
