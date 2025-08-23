import { cn } from "@/utils/cn";
import { LoaderCircle } from "lucide-react";
import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "special";
  isPending?: boolean;
};

export function Button({
  className,
  children,
  variant,
  isPending,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={isPending}
      className={cn(
        "relative rounded p-2 transition-all duration-200 hover:cursor-pointer",
        variant === "special" &&
          "text-background bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600",
        isPending &&
          "flex cursor-wait items-center justify-center hover:cursor-wait",
        className,
      )}
      {...props}
    >
      {isPending ? <LoaderCircle className="h-6 w-6 animate-spin" /> : children}
    </button>
  );
}
