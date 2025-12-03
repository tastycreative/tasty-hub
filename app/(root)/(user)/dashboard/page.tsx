import { stackServerApp } from "@/stack/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignOutButton } from "@/components/auth/sign-out-button";


export default async function DashboardPage() {
  const user = await stackServerApp.getUser({ or: "redirect" });

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Tasty Hub! 🎉</CardTitle>
          <CardDescription>
            You&apos;re signed in as{" "}
            <span className="font-medium text-foreground">
              {user?.displayName || user?.primaryEmail || "User"}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="rounded-lg bg-muted p-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Account Details
            </h3>
            <div className="mt-2 space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Email:</span>{" "}
                {user?.primaryEmail}
              </p>
              <p>
                <span className="text-muted-foreground">User ID:</span>{" "}
                <code className="text-xs">{user?.id}</code>
              </p>
            </div>
          </div>
          <SignOutButton />
        </CardContent>
      </Card>
    </div>
  );
}
