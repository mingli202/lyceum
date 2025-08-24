import Image from "next/image";
import Link from "next/link";

type AvatarProps = {
  src?: string;
  displayName: string;
};
export function Avatar({ src, displayName }: AvatarProps) {
  return (
    <Link href="/profile" className="justify-left flex items-center gap-4">
      {src ? (
        <Image
          src={src}
          alt={displayName}
          width={44}
          height={44}
          className="rounded-full"
        />
      ) : (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-200">
          {displayName.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="text-sm">
        <p>{displayName}</p>
        <p className="text-xs text-gray-700">View Profile</p>
      </div>
    </Link>
  );
}
