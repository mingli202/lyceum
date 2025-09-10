import { cn } from "@/utils/cn";
import Image from "next/image";
import { HTMLProps, RefObject } from "react";

type ProfilePictureProps = {
  src?: string;
  displayName: string;
  imageRef?: RefObject<HTMLImageElement | null>;
  displayRing?: boolean;
} & HTMLProps<HTMLDivElement>;
export function ProfilePicture({
  src,
  displayName,
  className,
  imageRef,
  displayRing,
  ...props
}: ProfilePictureProps) {
  return (
    <div
      className={cn(
        "relative h-11 w-11 shrink-0 overflow-hidden rounded-full",
        displayRing && "outline-background outline-4",
        className,
      )}
      {...props}
    >
      {src ? (
        <Image
          src={src}
          alt={displayName}
          fill
          objectFit="cover"
          ref={imageRef}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-200">
          {displayName.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}
