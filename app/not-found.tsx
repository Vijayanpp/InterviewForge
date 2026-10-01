import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center gap-md bg-background px-lg text-center"
    >
      <BrandLogo variant="compact" href="/" />
      <h1 className="font-headline-lg text-headline-lg">Page not found</h1>
      <p className="max-w-md text-muted-foreground">
        That URL does not exist. Head back home or start a practice interview.
      </p>
      <div className="flex flex-wrap justify-center gap-md">
        <Link href="/" className="font-semibold text-primary underline-offset-4 hover:underline">
          Go to homepage
        </Link>
        <Link
          href="/register"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Start free interview
        </Link>
      </div>
    </main>
  );
}
