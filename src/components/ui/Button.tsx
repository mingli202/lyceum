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

export const PaddingSize = {
  none: "none",
  sm: "sm",
  base: "base",
  md: "md",
  lg: "lg",
};
export type PaddingSize = RecordValues<typeof PaddingSize>;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  HTMLProps<HTMLButtonElement> & {
    variant?: ButtonVariant;
    isPending?: boolean;
    pendingElement?: React.ReactNode;
    paddingSize?: PaddingSize;
  };

export function Button({
  className,
  children,
  variant,
  isPending,
  pendingElement,
  paddingSize = PaddingSize.base,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={isPending}
      className={cn(
        "relative h-fit w-fit transform cursor-pointer rounded transition-all",
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
          "hover:text-foreground hover:ring-muted-foreground/80":
            variant === "muted",
        },
        {
          "px-0 py-0": paddingSize === PaddingSize.none,
          "px-1 py-0.5": paddingSize === PaddingSize.sm,
          "px-2 py-1": paddingSize === PaddingSize.base,
          "px-3 py-1.5": paddingSize === PaddingSize.md,
          "px-4 py-2": paddingSize === PaddingSize.lg,
        },
        isPending &&
          "flex cursor-wait items-center justify-center hover:cursor-wait",
        props.disabled && "cursor-not-allowed",
        className,
      )}
      {...props}
    >
      {isPending
        ? (pendingElement ?? <LoaderCircle className="h-5 w-5 animate-spin" />)
        : children}
    </button>
  );
}

export function TimeTrackingButton(props: ButtonProps) {
  return <Button {...props} />;
}
