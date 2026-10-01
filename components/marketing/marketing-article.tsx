export function MarketingArticle({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto w-full max-w-3xl px-lg py-2xl lg:px-xl">
      <header className="space-y-md">
        <h1 className="font-headline-lg text-headline-lg text-foreground">{title}</h1>
        {description ? (
          <p className="font-body-lg text-body-lg text-muted-foreground">{description}</p>
        ) : null}
      </header>
      <div className="mt-xl space-y-lg font-body-md text-body-md leading-relaxed text-foreground">
        {children}
      </div>
    </article>
  );
}
