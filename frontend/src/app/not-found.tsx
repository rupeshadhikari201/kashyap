"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Frown } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="mx-auto max-w-md text-center space-y-6 px-6">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Frown className="w-10 h-10 text-primary" />
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          404 – Page Not Found
        </h1>

        {/* Message */}
        <p className="text-muted-foreground">
          The page you’re looking for doesn’t exist (anymore).
        </p>

        {/* Home button */}
        <Button asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Link>
        </Button>
      </div>
    </main>
  );
}