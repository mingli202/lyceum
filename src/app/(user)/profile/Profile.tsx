import { Button, ButtonVariant } from "@/components";
import { ProfileData } from "@convex/types";
import { GraduationCap, MapPin, School } from "lucide-react";
import UserActivity from "./UserActivity";
import { ProfilePicture } from "@/components/ProfilePicture";

type ProfileProps = {
  data: ProfileData;
  currentClerkId: string;
};
export default function Profile({ data, currentClerkId }: ProfileProps) {
  return (
    <div className="flex h-full w-full justify-center overflow-x-hidden overflow-y-auto">
      <section className="flex h-fit w-full max-w-3xl flex-col gap-2 p-6">
        <div className="flex justify-between gap-4 rounded-lg p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <ProfilePicture
                src={data.pictureUrl}
                displayName={data.firstName}
                className="h-20 w-20"
              />
              <div className="shrink-0 space-y-1">
                <p className="overflow-ellipsis whitespace-nowrap">
                  {data.firstName} {data.lastName}
                </p>
                <p className="text-muted-foreground">@{data.username}</p>
                <div className="text-muted-foreground flex gap-2">
                  <p>{data.followers.length} Followers</p>
                  <p>{data.following.length} Following</p>
                </div>
              </div>
              <div className="basis-full" />
            </div>
            {data.bio && <div>{data.bio}</div>}
          </div>

          <div className="flex flex-col items-end space-y-1">
            {data.city && (
              <div className="flex gap-2">
                <span>{data.city}</span>
                <MapPin />
              </div>
            )}
            <div className="flex gap-2">
              <span>
                {data.school} {data.academicYear}
              </span>
              <School />
            </div>
            <div className="flex gap-2">
              <span>{data.major}</span>
              <GraduationCap />
            </div>
            {data.bio && <div>{data.bio}</div>}
          </div>
        </div>
        <div className="space-y-1"></div>
        <UserActivity />
      </section>
    </div>
  );
}
