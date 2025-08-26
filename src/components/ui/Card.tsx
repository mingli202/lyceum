import { cn } from "@/utils/cn";
import { HTMLAttributes, ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  clickable?: boolean;
} & HTMLAttributes<HTMLDivElement>;
export function Card({ children, clickable, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-background ring-foreground/10 z-0 gap-2 space-y-2 rounded-lg p-3 text-sm shadow-md ring-1",
        clickable &&
          "transition hover:z-10 hover:cursor-pointer hover:shadow-lg",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
  ...props
}: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("text-muted-foreground text-sm", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
  ...props
}: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("font-bold", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className,
  ...props
}: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return (
    <>
      <hr className="border-foreground/20 my-2" />
      <div className={cn("flex", className)} {...props}>
        {children}
      </div>
    </>
  );
}
