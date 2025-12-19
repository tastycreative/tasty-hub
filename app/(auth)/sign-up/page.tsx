import { redirect } from "next/navigation";

export default function SignUpPage() {
  // Sign-up is disabled, redirect to sign-in
  redirect("/sign-in");
}
