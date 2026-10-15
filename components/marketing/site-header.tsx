import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemePicker } from "@/components/theme/theme-picker";
import { MobileNavSheet } from "@/components/layout/mobile-nav-sheet";
import { BRAND_NAME } from "@/lib/brand";

const NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "Process" },
  { href: "/#faq", label: "FAQ" },
  { href: "/about", label: "About" },
];

/** Marketing header: text brand only (no logo mark), no Pricing. Theme-aware. */
export function SiteHeader() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-container-max items-center justify-between px-lg lg:px-xl">
        <Link
          href="/"
          className="brand-gradient-text truncate font-headline-md text-base font-bold sm:text-headline-md"
        >
          {BRAND_NAME}
        </Link>

        <nav className="hidden items-center gap-lg md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-label-md text-label-md text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex min-w-0 items-center gap-xs sm:gap-sm">
          <MobileNavSheet label="Site" items={NAV_LINKS} triggerClassName="md:hidden" />
          <ThemePicker variant="topbar" />
          <Button
            variant="ghost"
            className="hidden sm:inline-flex"
            nativeButton={false}
            render={<Link href="/login">Log in</Link>}
          />
          <Button
            variant="gradient"
            className="px-md sm:px-lg"
            nativeButton={false}
            render={
              <Link href="/register">
                <span className="sm:hidden">Start</span>
                <span className="hidden sm:inline">Start Free Interview</span>
              </Link>
            }
          />
        </div>
      </div>
    </header>
  );
}
