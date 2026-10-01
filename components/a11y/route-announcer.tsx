"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function RouteAnnouncer() {
  const pathname = usePathname();
  const [message, setMessage] = useState("");

  useEffect(() => {
    const title = typeof document !== "undefined" ? document.title : pathname;
    setMessage(`Navigated to ${title}`);
  }, [pathname]);

  return (
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {message}
    </div>
  );
}
