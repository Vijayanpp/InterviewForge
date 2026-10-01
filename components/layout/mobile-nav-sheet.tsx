"use client";

import { useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function MobileNavSheet({
  label,
  items,
  triggerClassName = "lg:hidden",
}: {
  label: string;
  items: Array<{ href: string; label: string; icon?: LucideIcon }>;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={triggerClassName}
            aria-label={`Open ${label} menu`}
          >
            <Menu className="size-5" aria-hidden />
          </Button>
        }
      />
      <SheetContent side="left" className="w-72 bg-background">
        <SheetHeader>
          <SheetTitle>{label}</SheetTitle>
          <SheetDescription className="sr-only">Navigate {label} pages</SheetDescription>
        </SheetHeader>
        <nav aria-label={label} className="flex flex-col gap-xs px-md pb-md">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-md rounded-lg px-md py-sm text-foreground hover:bg-muted"
              >
                {Icon ? <Icon className="size-5 shrink-0" aria-hidden /> : null}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
