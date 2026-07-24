import Link from "next/link";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

const PRODUCT_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/practice", label: "Live Coding" },
  { href: "/interviews/new", label: "System Design" },
];

const COMPANY_LINKS = [
  { href: "/#how-it-works", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "https://rzp.io/rzp/FnEvT7Ff", label: "Support / Donate", external: true },
];

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

/** Stitch-style footer (Product / Company / Legal / Social). No logo mark, no Pricing. */
export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background py-xl">
      <div className="mx-auto max-w-container-max px-lg lg:px-xl">
        <div className="mb-xl flex flex-col gap-xl lg:flex-row lg:justify-between lg:gap-2xl">
          <div className="max-w-md shrink-0 space-y-md text-left">
            <p className="brand-gradient-text font-headline-md text-headline-md font-bold">
              {BRAND_NAME}
            </p>
            <p className="brand-gradient-text font-label-sm text-label-sm uppercase tracking-[0.16em]">
              {BRAND_TAGLINE}
            </p>
            <p className="font-body-sm text-body-sm text-muted-foreground">
              The ultimate AI-powered environment for mastering technical and soft-skill interviews.
              Built for engineers, by engineers.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-xl sm:grid-cols-4 lg:flex-1 lg:justify-end">
            <div>
              <h5 className="mb-md font-label-md text-label-md text-foreground">Product</h5>
              <ul className="space-y-sm text-sm text-muted-foreground">
                {PRODUCT_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="transition-colors hover:text-primary">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="mb-md font-label-md text-label-md text-foreground">Company</h5>
              <ul className="space-y-sm text-sm text-muted-foreground">
                {COMPANY_LINKS.map((l) => (
                  <li key={l.href}>
                    {l.external ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noreferrer"
                        className="transition-colors hover:text-primary"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className="transition-colors hover:text-primary">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="mb-md font-label-md text-label-md text-foreground">Legal</h5>
              <ul className="space-y-sm text-sm text-muted-foreground">
                {LEGAL_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="transition-colors hover:text-primary">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="mb-md font-label-md text-label-md text-foreground">Social</h5>
              <div className="flex gap-md">
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground transition-colors hover:text-primary"
                  aria-label="X"
                >
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden>
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.924L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground transition-colors hover:text-primary"
                  aria-label="LinkedIn"
                >
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden>
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-md border-t border-border pt-lg text-sm text-muted-foreground md:flex-row">
          <p>
            © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-md">
            <span>
              Status: <span className="text-emerald-600">Operational</span>
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
          </div>
        </div>
      </div>
    </footer>
  );
}
