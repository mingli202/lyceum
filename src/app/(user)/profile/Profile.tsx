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
      <section className="flex h-fit w-3xl flex-col gap-2 p-6">
        <div className="bg-background ring-foreground/10 flex justify-center gap-10 rounded-lg p-4 shadow-md ring-1">
          <ProfilePicture
            src={data.pictureUrl}
            displayName={data.firstName}
            className="h-30 w-30"
          />

          <div className="flex flex-col gap-4">
            <div className="shrink-0 space-y-1">
              <div className="flex items-center gap-3">
                <p>@{data.username}</p>
                {currentClerkId === data.clerkId ? (
                  <Button variant={ButtonVariant.Muted}>Edit</Button>
                ) : (
                  <Button variant={ButtonVariant.Special} className="py-1">
                    Follow
                  </Button>
                )}
              </div>
              <div className="text-muted-foreground flex gap-3 text-sm">
                <p>{data.followers.length} Followers</p>
                <p>{data.following.length} Following</p>
              </div>
            </div>

            <div className="space-y-1">
              {data.firstName} {data.lastName}
              {data.city && (
                <div className="flex gap-2">
                  <MapPin />
                  <span>{data.city}</span>
                </div>
              )}
              <div className="flex gap-2">
                <School />
                <span>
                  {data.school} {data.academicYear}
                </span>
              </div>
              <div className="flex gap-2">
                <GraduationCap />
                <span>{data.major}</span>
              </div>
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
