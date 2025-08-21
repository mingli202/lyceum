import Navbar from "./Navbar";

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-full w-full bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      {children}
    </div>
  );
}
