import { UserCardInfo } from "@convex/types";
import { ProfilePicture, Card } from "..";
import Link from "next/link";

type UserCardProps = {
  user: UserCardInfo;
};
export function UserCard({ user }: UserCardProps) {
  return (
    <Link href={`/user?id=${user.userId}`}>
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
