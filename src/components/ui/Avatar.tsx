import Link from "next/link";
import { ProfilePicture } from "..";

type AvatarProps = {
  src?: string;
  displayName: string;
};
export function Avatar({ src, displayName }: AvatarProps) {
  return (
    <Link href="/profile" className="justify-left flex items-center gap-4">
      <ProfilePicture src={src} displayName={displayName} />
      <div className="text-sm">
        <p>{displayName}</p>
        <p className="text-xs text-gray-700">View Profile</p>
      </div>
    </Link>
  );
}
