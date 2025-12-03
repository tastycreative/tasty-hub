"use client";

import { useStackApp } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const app = useStackApp();
  const router = useRouter();

  const handleSignOut = async () => {
    await app.signOut();
    router.push("/sign-in");
  };

  return (
    <Button variant="outline" onClick={handleSignOut}>
      Sign Out
    </Button>
  );
}
