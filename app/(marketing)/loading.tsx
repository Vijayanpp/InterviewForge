export default function MarketingLoading() {
  return (
    <div className="mx-auto max-w-container-max px-lg py-2xl" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading page</span>
      <div className="h-10 w-2/3 max-w-xl animate-pulse rounded-lg bg-muted" />
      <div className="mt-md h-24 max-w-2xl animate-pulse rounded-lg bg-muted" />
      <div className="mt-xl grid gap-lg md:grid-cols-2">
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    </div>
  );
}
