import { RecordValues } from "@/types";

export * from "./Card";
export * from "./Grid";
export * from "./Avatar";
export * from "./Button";

export const ButtonVariant = {
  Special: "special",
  Destructive: "destructive",
  Muted: "muted",
} as const;
export type ButtonVariant = RecordValues<typeof ButtonVariant>;

export const PaddingSize = {
  none: "none",
  sm: "sm",
  base: "base",
  md: "md",
  lg: "lg",
} as const;
export type PaddingSize = RecordValues<typeof PaddingSize>;
