"use client";

import { RecordValues } from "@/types";
import { cn } from "@/utils/cn";
import { LoaderCircle } from "lucide-react";
import { ButtonHTMLAttributes, HTMLProps } from "react";

export const ButtonVariant = {
  Special: "special",
  Destructive: "destructive",
};
export type ButtonVariant = RecordValues<typeof ButtonVariant>;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  HTMLProps<HTMLButtonElement> & {
    variant?: ButtonVariant;
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
        "relative transform rounded p-2 transition-all duration-200 hover:cursor-pointer",
        {
          "text-background bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600":
            variant === "special",
          "text-background bg-gradient-to-br from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600":
            variant === "destructive",
        },
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
