import { UserCardInfo } from "@convex/types";
import { ProfilePicture } from "./ProfilePicture";
import Link from "next/link";
import { Card } from "./ui/Card";

type UserCardProps = {
  user: UserCardInfo;
};
export function UserCard({ user }: UserCardProps) {
  return (
    <Link href={`/user/${user.userId}`}>
      <Card className="flex flex-row items-center" clickable>
        <ProfilePicture src={user.pictureUrl} displayName={user.firstName} />
        <div className="flex h-fit flex-col justify-center">
          <p className="truncate font-bold">{user.firstName}</p>
          <p>@{user.username}</p>
        </div>
      </Card>
    </Link>
  );
}
