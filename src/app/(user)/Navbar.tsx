"use client";

import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/utils/cn";
import {
  Calendar,
  Home,
  LayoutDashboard,
  Search,
  UserIcon,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathName = usePathname() ?? "";

  return (
    <section className="flex h-full flex-col gap-2 p-4">
      <div className="h-12 w-52 shrink-0 ring-1 ring-black">
        Logo placeholder
      </div>
      <NavItem href="/dashboard" currentPath={pathName}>
        <LayoutDashboard /> Dashboard
      </NavItem>
      <NavItem href="/feed" currentPath={pathName}>
        <Home /> Feed
      </NavItem>
      <NavItem href="/calendar" currentPath={pathName}>
        <Calendar /> Calendar
      </NavItem>
      <NavItem href="/clubs" currentPath={pathName}>
        <Users /> Clubs
      </NavItem>
      <NavItem href="/search" currentPath={pathName}>
        <Search /> Search
      </NavItem>
      <NavItem href="/profile" currentPath={pathName}>
        <UserIcon /> Profile
      </NavItem>
      <div className="basis-full" />
      <div className="shrink-0 p-2">
        <Avatar src={undefined} displayName="Vincent Liu" />
      </div>
    </section>
  );
}

type NavItemProps = {
  href: string;
  children: React.ReactNode;
  currentPath: string;
};
function NavItem({ href, children, currentPath }: NavItemProps) {
  const isActive = currentPath === href;

  return (
    <Link
      href={href}
      className={cn(
        "relative flex shrink-0 items-center gap-2 space-x-3 rounded-lg px-4 py-3 transition-all duration-200",
        isActive
          ? "bg-gradient-to-r from-blue-100 to-indigo-100 font-semibold text-indigo-700 shadow-sm"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
      )}
    >
      {children}
    </Link>
  );
}
