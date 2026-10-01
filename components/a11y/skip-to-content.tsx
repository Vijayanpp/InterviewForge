export function SkipToContent({ href = "#main-content" }: { href?: string }) {
  return (
    <a href={href} className="skip-to-content">
      Skip to main content
    </a>
  );
}
