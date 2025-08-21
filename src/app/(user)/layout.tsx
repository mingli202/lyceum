import Navbar from "./Navbar";

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-full w-full">
      <Navbar />
      {children}
    </div>
  );
}
