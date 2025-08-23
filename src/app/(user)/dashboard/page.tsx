import Dashboard from "./Dashboard";
import { api } from "../../../../convex/_generated/api";
import { DashboardData } from "../../../../convex/types";
import { Id } from "../../../../convex/_generated/dataModel";
import { fetchQuery } from "convex/nextjs";
import { auth } from "@clerk/nextjs/server";
import { SignatureService } from "../../../../convex/services/signatureService";

const _placeHolderData: DashboardData = {
  classesInfo: Array(40).fill({
    code: "CSCI-101",
    title: "Introduction to Computer Science",
    professor: "Dr. John Doe",
    _id: "62e9c8d8c3a2a1d3c0a9" as Id<"classes">,
    grade: 80,
  }),
};

// TODO: transition animations instead of loading spinner
export default async function DashboardPage() {
  const { userId } = await auth();
  const body = { clerkId: userId };
  const signature = await new SignatureService().sign(body);

  const data = await fetchQuery(api.queries.getDashboardData, {
    signature,
  });

  return <Dashboard data={data} />;
}
