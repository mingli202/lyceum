import { RecordValues } from "@/types";
import { cn } from "@/utils/cn";

export const GridChildrenSize = {
  sm: "sm",
  md: "md",
  base: "base",
  lg: "lg",
  xl: "xl",
} as const;

export type GridChildrenSize = RecordValues<typeof GridChildrenSize>;

type Props = {
  children: React.ReactNode;
  childrenSize?: GridChildrenSize;
} & React.HTMLAttributes<HTMLDivElement>;

export function Grid({
  children,
  childrenSize = GridChildrenSize.base,
  ...props
}: Props) {
  return (
    <div
      className={cn("grid gap-2", {
        "grid-cols-[repeat(auto-fit,minmax(12rem,1fr))]": childrenSize === "sm",
        "grid-cols-[repeat(auto-fit,minmax(15rem,1fr))]": childrenSize === "md",
        "grid-cols-[repeat(auto-fit,minmax(18rem,1fr))]":
          childrenSize === "base",
        "grid-cols-[repeat(auto-fit,minmax(20rem,1fr))]": childrenSize === "lg",
        "grid-cols-[repeat(auto-fit,minmax(22rem,1fr))]": childrenSize === "xl",
      })}
      {...props}
    >
      {children}
      <div className="col-span-full h-0" />
    </div>
  );
}
