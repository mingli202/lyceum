import { cn } from "@/utils/cn";
import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "special";
};

export function Button({
  className,
  children,
  variant,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "text rounded p-2 transition-all duration-200 hover:cursor-pointer",
        variant === "special" &&
          "text-background bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
