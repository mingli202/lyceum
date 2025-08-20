import { login } from "@/actions/auth";
import { redirect } from "next/navigation";

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isLoggedIn = await login();

  if (!isLoggedIn.ok) {
    console.log("redirecting");
    redirect("/");
  }

  return children;
}
