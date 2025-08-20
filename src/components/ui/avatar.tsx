import Image from "next/image";

type AvatarProps = {
  src?: string;
  displayName: string;
};
export function Avatar({ src, displayName }: AvatarProps) {
  return (
    <div className="flex items-center justify-center">
      {src ? (
        <Image
          src={src}
          alt={displayName}
          width={40}
          height={40}
          className="h-full w-full rounded-full"
        />
      ) : (
        <div className="h-full w-full rounded-full bg-gray-200">
          {displayName.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="text-sm font-medium text-gray-900">{displayName}</div>
    </div>
  );
}
