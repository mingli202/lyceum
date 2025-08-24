import Dashboard from "./Dashboard";
import { fetchQuery } from "convex/nextjs";
import { auth } from "@clerk/nextjs/server";
import { SignatureService } from "@convex/services/signatureService";
import { api } from "@convex/_generated/api";

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
