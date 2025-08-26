"use client";

import { RecordValues } from "@/types";
import { cn } from "@/utils/cn";
import { LoaderCircle } from "lucide-react";
import { ButtonHTMLAttributes, HTMLProps } from "react";

export const ButtonVariant = {
  Special: "special",
  Destructive: "destructive",
  Muted: "muted",
};
export type ButtonVariant = RecordValues<typeof ButtonVariant>;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  HTMLProps<HTMLButtonElement> & {
    variant?: ButtonVariant;
    isPending?: boolean;
    pendingElement?: React.ReactNode;
  };

export function Button({
  className,
  children,
  variant,
  isPending,
  pendingElement,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={isPending}
      className={cn(
        "relative transform cursor-pointer rounded p-2 transition-all duration-200",
        {
          "text-background bg-gradient-to-r from-blue-500 to-indigo-500":
            variant === "special",
          "text-background bg-gradient-to-br from-amber-500 to-red-500":
            variant === "destructive",
          "ring-muted-foreground/50 text-muted-foreground ring-1":
            variant === "muted",
        },
        !props.disabled && {
          "hover:from-blue-600 hover:to-indigo-600": variant === "special",
          "hover:from-amber-600 hover:to-red-600": variant === "destructive",
          "hover:text-foreground ring-1": variant === "muted",
        },
        isPending &&
          "flex cursor-wait items-center justify-center hover:cursor-wait",
        props.disabled && "cursor-not-allowed",
        className,
      )}
      {...props}
    >
      {isPending
        ? (pendingElement ?? <LoaderCircle className="h-6 w-6 animate-spin" />)
        : children}
    </button>
  );
}
