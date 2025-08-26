import { UserCardInfo } from "@convex/types";
import { ProfilePicture } from "./ProfilePicture";
import Link from "next/link";

type UserCardProps = {
  user: UserCardInfo;
};
export function UserCard({ user }: UserCardProps) {
  return (
    <Link
      href={`/user/${user.userId}`}
      className="bg-background ring-foreground/10 z-0 flex items-center gap-2 rounded-lg p-3 text-sm shadow-md ring-1 transition hover:z-10 hover:cursor-pointer hover:shadow-lg"
    >
      <ProfilePicture src={user.pictureUrl} displayName={user.firstName} />
      <div className="flex h-fit flex-col justify-center">
        <p className="truncate font-bold">{user.firstName}</p>
        <p>@{user.username}</p>
      </div>
    </Link>
  );
}
