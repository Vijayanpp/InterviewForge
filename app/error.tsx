"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center gap-md bg-background px-lg text-center"
    >
      <h1 className="font-headline-lg text-headline-lg">Something went wrong</h1>
      <p className="max-w-md text-muted-foreground">
        The page failed to load. Try again, or return home.
      </p>
      <div className="flex flex-wrap justify-center gap-md">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-primary px-lg py-sm font-label-md text-primary-foreground"
        >
          Try again
        </button>
        <Link href="/" className="font-semibold text-primary underline-offset-4 hover:underline">
          Go to homepage
        </Link>
      </div>
    </main>
  );
}
