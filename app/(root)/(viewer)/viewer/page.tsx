"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Mail, AlertCircle } from "lucide-react";

/**
 * Viewer Dashboard - Pending Access Page
 * Shown to users with VIEWER role who are waiting for access to be granted
 */
export default function ViewerPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome to Tasty Hub</h1>
          <p className="text-muted-foreground">
            Your account is pending approval
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-1 max-w-2xl mx-auto mt-8">
        {/* Main Pending Card */}
        <Card className="border-primary/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Access Pending</CardTitle>
            <CardDescription className="text-base">
              Your account has been created successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">What&apos;s Next?</p>
                  <p className="text-sm text-muted-foreground">
                    An administrator will review your account and assign you to a team with the appropriate permissions.
                    You&apos;ll be notified via email once your access has been granted.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">While you wait:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Check your email for updates on your account status</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Update your profile information in the sidebar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Review any documentation or resources available to you</span>
                </li>
              </ul>
            </div>

            <div className="pt-4">
              <Button variant="outline" className="w-full" asChild>
                <a href="mailto:admin@tastyhub.com">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Support
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              If you believe this is an error or if you&apos;ve been waiting for an extended period,
              please contact your administrator or our support team.
            </p>
            <div className="text-sm">
              <p className="font-medium mb-1">Expected wait time:</p>
              <p className="text-muted-foreground">
                Most accounts are reviewed within 24-48 hours during business days.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
