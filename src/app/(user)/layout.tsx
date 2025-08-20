import { login } from "@/actions/auth";
import { redirect } from "next/navigation";
import Navbar from "./Navbar";

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isLoggedIn = await login({ setCookies: false });

  if (!isLoggedIn.ok) {
    console.log("redirecting");
    redirect("/");
  }

  return (
    <div className="flex h-full w-full">
      <Navbar />
      {children}
    </div>
  );
}
