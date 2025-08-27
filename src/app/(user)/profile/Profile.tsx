import { ProfileData } from "@convex/types";
import { MapPin, School } from "lucide-react";
import UserActivity from "./UserActivity";
import { ProfilePicture } from "@/components/ProfilePicture";
import { Button, ButtonVariant } from "@/components";

type ProfileProps = {
  data: ProfileData;
  currentClerkId: string;
};
export default function Profile({ data, currentClerkId }: ProfileProps) {
  return (
    <div className="flex h-full w-full justify-center overflow-x-hidden overflow-y-auto">
      <section className="flex h-fit w-full max-w-2xl flex-col">
        <div className="bg-muted-foreground/10 relative h-50 w-full">
          <ProfilePicture
            src={data.pictureUrl}
            displayName={data.firstName}
            className="absolute bottom-0 left-6 h-34 w-34 translate-y-1/2"
          />
        </div>
        <div className="flex w-full justify-end p-6">
          {data.clerkId === currentClerkId ? (
            <Button variant={ButtonVariant.Muted}>Edit</Button>
          ) : (
            <Button variant={ButtonVariant.Special}>Follow</Button>
          )}
        </div>
        <div className="flex flex-col justify-between gap-2 px-8 text-sm">
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              <p className="text-2xl font-bold overflow-ellipsis whitespace-nowrap">
                {data.firstName} {data.lastName}
              </p>
              <p className="text-muted-foreground">@{data.username}</p>
            </div>
            <div className="basis-full" />
          </div>
          {data.bio && <div>{data.bio}</div>}

          <div className="text-muted-foreground">
            <div className="flex items-center gap-2">
              <School className="h-4 w-4" />
              <span>
                {data.school} · {data.academicYear - 2024}st Year · {data.major}
              </span>
            </div>
            {data.city && (
              <div className="flex gap-2">
                <MapPin className="h-4 w-4" />
                <span>{data.city}</span>
              </div>
            )}
          </div>

          <div className="mb-2 flex gap-2">
            <p>
              <span className="font-bold">{data.followers.length + " "}</span>
              <span className="text-muted-foreground">Followers</span>
            </p>
            <p>
              <span className="font-bold">{data.following.length + " "}</span>
              <span className="text-muted-foreground">Following</span>
            </p>
          </div>
        </div>
        <UserActivity />
      </section>
    </div>
  );
}
