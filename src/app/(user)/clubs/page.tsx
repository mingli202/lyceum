"use client";

import { ClubCard, Grid } from "@/components";
import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { Volleyball } from "lucide-react";
import CreateClubDialog from "./CreateClubDialog";

export default function ClubsPage() {
  const userClubs = useQuery(api.queries.getUserClubs, { canView: true });

  return (
    <section className="flex h-full w-full flex-col gap-4 p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-indigo-700">
            <Volleyball /> Clubs
          </h1>
          <p>Connect with communities that share your interests.</p>
        </div>

        <CreateClubDialog />
      </div>
      <div className="flex h-full w-full flex-col gap-2">
        <div className="flex h-full w-full flex-col gap-2">
          <h2 className="text-xl font-bold">My clubs</h2>
          <Grid>
            {userClubs?.map((club) => (
              <ClubCard club={club} key={club.clubId} />
            ))}
          </Grid>
        </div>
      </div>
    </section>
  );
}
