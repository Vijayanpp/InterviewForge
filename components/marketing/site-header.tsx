import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ThemePicker } from "@/components/theme/theme-picker";

const NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "Process" },
  { href: "/#technologies", label: "Technologies" },
];

export function SiteHeader() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-container-max items-center justify-between px-lg lg:px-xl">
        <BrandLogo variant="mark" href="/" />

        <nav className="hidden items-center gap-lg md:flex">
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

        <div className="flex items-center gap-sm">
          <ThemePicker variant="topbar" />
          <Button variant="ghost" nativeButton={false} render={<Link href="/login">Log in</Link>} />
          <Button nativeButton={false} render={<Link href="/register">Start Free Interview</Link>} />
        </div>
      </div>
    </header>
  );
}
