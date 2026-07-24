import Link from "next/link";
import { BrandLogo, BrandTagline } from "@/components/brand/brand-logo";
import { BRAND_NAME } from "@/lib/brand";

const FOOTER_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto flex max-w-container-max flex-col items-center justify-between gap-md px-lg py-lg lg:flex-row lg:px-xl">
        <div className="flex flex-col items-center gap-sm lg:items-start">
          <BrandLogo variant="mark" href="/" />
          <BrandTagline compact />
          <p className="font-body-sm text-body-sm text-muted-foreground">
            © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
          </p>
        </div>
        <div className="flex gap-lg">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-label-sm text-label-sm text-muted-foreground hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
