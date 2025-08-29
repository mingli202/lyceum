import { ClubCategory, ClubPreviewInfo } from "@convex/types";
import Link from "next/link";
import { ProfilePicture } from "../profile";
import { User } from "lucide-react";
import { cn } from "@/utils/cn";

type ClubCardProps = {
  club: ClubPreviewInfo;
};

export function ClubCard({ club }: ClubCardProps) {
  const CategoryColorMap: Record<ClubCategory, string> = {
    Sports: "bg-red-200 text-red-700 ring-red-400",
    Social: "bg-orange-200 text-orange-700 ring-orange-400",
    Arts: "bg-yellow-200 text-yellow-700 ring-yellow-400",
    Recreational: "bg-green-200 text-green-700 ring-green-400",
    Academic: "bg-blue-200 text-blue-700 ring-blue-400",
    Cultural: "bg-pink-200 text-pink-700 ring-pink-400",
    Volunteer: "bg-purple-200 text-purple-700 ring-purple-400",
    Other: "bg-gray-200 text-gray-700 ring-gray-400",
  } as const;

  return (
    <Link
      href={`/club/${club.clubId}`}
      className="ring-foreground/10 bg-background flex w-full gap-2 rounded-lg p-2 shadow-md ring-1 transition hover:z-10 hover:cursor-pointer hover:shadow-lg"
    >
      <ProfilePicture src={club.pictureUrl} displayName={club.name} />
      <div className="space-y-1">
        <div className="flex gap-2">
          <p className="font-bold">{club.name} </p>
          <span className="text-muted-foreground flex items-center">
            <User className="h-4 w-4" /> {club.nMembers}
          </span>
        </div>
        <p className="text-muted-foreground line-clamp-2">{club.description}</p>
        <div className="flex gap-2 text-xs">
          <p
            className={cn(
              CategoryColorMap[club.category],
              "rounded-full px-1 py-0.5 ring-1",
            )}
          >
            {club.category}
          </p>
          <p
            className={cn(
              "text-bold rounded-full bg-gradient-to-br px-1 py-0.5 ring-1",
              {
                "from-yellow-200 to-red-300 text-orange-700 ring-orange-400":
                  club.status === "member",
                "from-sky-200 to-violet-300 text-indigo-700 ring-indigo-400":
                  club.status === "admin",
                "from-green-200 to-teal-300 text-emerald-700 ring-emerald-400":
                  club.status === "following",
              },
            )}
          >
            {club.status}
          </p>
        </div>
      </div>
    </Link>
  );
}
