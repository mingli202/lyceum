import { RecordValues } from "@/types";
import { cn } from "@/utils/cn";
import { LoaderCircle } from "lucide-react";
import { ButtonHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";

export const ButtonVariant = {
  special: "special",
  destructive: "destructive",
};
export type ButtonVariant = RecordValues<typeof ButtonVariant>;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({
  className,
  children,
  variant,
  ...props
}: ButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      className={cn(
        "relative rounded p-2 transition-all duration-200 hover:cursor-pointer",
        variant === "special" &&
          "text-background bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600",
        pending &&
          "flex cursor-wait items-center justify-center hover:cursor-wait",
        className,
      )}
      {...props}
    >
      {pending ? <LoaderCircle className="h-6 w-6 animate-spin" /> : children}
    </button>
  );
}
