import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await stackServerApp.getUser({ or: "redirect" });

  return <>{children}</>;
}
