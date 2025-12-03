import { redirect } from "next/navigation";
import { stackServerApp } from "@/stack/server";

export default async function Home() {
  const user = await stackServerApp.getUser();

  // Always redirect - if user exists go to dashboard, otherwise sign-in
  redirect(user ? "/dashboard" : "/sign-in");
}
