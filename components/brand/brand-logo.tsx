import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BRAND_LOGO_SRC, BRAND_NAME, BRAND_TAGLINE, BRAND_TAGLINE_COMPACT } from "@/lib/brand";

type BrandLogoVariant = "full" | "compact" | "mark";

/**
 * Official InterviewForge logo (used as provided — white background kept).
 */
export function BrandLogo({
  variant = "compact",
  href = "/",
  className,
  priority = false,
  /** Kept for call-site compatibility; logo is the same on light and dark. */
  onDark: _onDark = false,
}: {
  variant?: BrandLogoVariant;
  href?: string | null;
  className?: string;
  priority?: boolean;
  onDark?: boolean;
}) {
  void _onDark;

  const size =
    variant === "full"
      ? { width: 360, height: 360, className: "h-48 w-auto max-w-full sm:h-56" }
      : variant === "mark"
        ? { width: 120, height: 120, className: "h-11 w-auto" }
        : { width: 200, height: 200, className: "h-16 w-auto max-w-[200px]" };

  const image = (
    <Image
      src={BRAND_LOGO_SRC}
      alt={BRAND_NAME}
      width={size.width}
      height={size.height}
      priority={priority}
      className={cn("rounded-md object-contain object-left", size.className)}
    />
  );

  if (!href) {
    return <div className={cn("inline-flex items-center", className)}>{image}</div>;
  }

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      aria-label={BRAND_NAME}
    >
      {image}
    </Link>
  );
}

/** Tagline-only line for footers / hero supporting copy. */
export function BrandTagline({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <p
      className={cn(
        "font-semibold uppercase tracking-[0.2em] text-muted-foreground",
        compact ? "text-[10px]" : "text-label-sm",
        className
      )}
    >
      {compact ? BRAND_TAGLINE_COMPACT : BRAND_TAGLINE}
    </p>
  );
}
