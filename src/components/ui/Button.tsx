"use client";

import { cn } from "@/utils/cn";
import { LoaderCircle } from "lucide-react";
import { ButtonHTMLAttributes, HTMLProps } from "react";
import { ButtonVariant, PaddingSize } from ".";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  HTMLProps<HTMLButtonElement> & {
    variant?: ButtonVariant;
    isPending?: boolean;
    pendingElement?: React.ReactNode;
    paddingSize?: PaddingSize;
    dropdown?: boolean;
  };

export function Button({
  className,
  children,
  variant,
  isPending,
  pendingElement,
  disabled,
  dropdown,
  paddingSize = PaddingSize.base,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={isPending && disabled}
      className={cn(
        "relative h-fit w-fit transform cursor-pointer rounded transition",
        dropdown
          ? "text-foreground bg-gradient-to-r"
          : {
              "text-background bg-gradient-to-r from-blue-500 to-indigo-500":
                variant === "special",
              "text-background bg-gradient-to-br from-amber-500 to-red-500":
                variant === "destructive",
              "ring-muted-foreground/50 text-muted-foreground ring-1":
                variant === "muted",
            },
        !disabled && {
          "hover:text-background hover:from-blue-600 hover:to-indigo-600":
            variant === ButtonVariant.Special,
          "hover:text-background hover:from-amber-600 hover:to-red-600":
            variant === ButtonVariant.Destructive,
          "hover:text-foreground hover:ring-muted-foreground/80":
            variant === ButtonVariant.Muted,
        },
        {
          "px-0 py-0": paddingSize === PaddingSize.none,
          "px-1 py-0.25": paddingSize === PaddingSize.sm,
          "px-2 py-1": paddingSize === PaddingSize.base,
          "px-3 py-1.5": paddingSize === PaddingSize.md,
          "px-4 py-2": paddingSize === PaddingSize.lg,
        },
        isPending &&
          "flex cursor-wait items-center justify-center hover:cursor-wait",
        disabled && "cursor-not-allowed",
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
