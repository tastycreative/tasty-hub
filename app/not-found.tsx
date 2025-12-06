"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <Card className="max-w-2xl w-full shadow-2xl border-2">
        <CardHeader className="text-center space-y-4 pb-8">
          {/* 404 Illustration */}
          <div className="flex items-center justify-center">
            <div className="relative">
              {/* Animated background circles */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-primary/10 animate-pulse" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: '2s' }} />
              </div>

              {/* Icon */}
              <div className="relative z-10 flex items-center justify-center w-32 h-32">
                <FileQuestion className="h-20 w-20 text-primary" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* 404 Text */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-7xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
                404
              </span>
            </div>
            <CardTitle className="text-3xl font-bold">Page Not Found</CardTitle>
            <CardDescription className="text-base max-w-md mx-auto">
              Oops! The page you're looking for seems to have wandered off.
              It might be under construction, moved, or never existed.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Helpful suggestions */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">Here's what you can do:</p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Double-check the URL for any typos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Return to the dashboard and navigate from there</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Use the search feature to find what you're looking for</span>
              </li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6">
          <Button asChild className="w-full sm:w-auto" size="lg">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Link>
          </Button>

          <Button
            onClick={() => router.back()}
            variant="outline"
            className="w-full sm:w-auto"
            size="lg"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </CardFooter>

        {/* Error code for reference */}
        <div className="px-6 pb-6">
          <p className="text-xs text-center text-muted-foreground">
            Error Code: <span className="font-mono font-semibold">HTTP 404</span>
          </p>
        </div>
      </Card>
    </div>
  );
}
