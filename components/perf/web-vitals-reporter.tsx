"use client";

import { useEffect } from "react";

type VitalName = "LCP" | "CLS" | "INP" | "TTFB" | "FCP";

function postVital(name: VitalName, value: number) {
  const body = JSON.stringify({
    name,
    value: Math.round(name === "CLS" ? value * 1000 : value),
    path: window.location.pathname,
  });
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/vitals", body);
    return;
  }
  void fetch("/api/vitals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  });
}

export function WebVitalsReporter() {
  useEffect(() => {
    if (typeof PerformanceObserver === "undefined") return;
    const observers: PerformanceObserver[] = [];

    try {
      const lcp = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) postVital("LCP", last.startTime);
      });
      lcp.observe({ type: "largest-contentful-paint", buffered: true });
      observers.push(lcp);
    } catch {
      // Unsupported in this browser.
    }

    try {
      let cls = 0;
      const layout = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
          if (!shift.hadRecentInput) cls += shift.value ?? 0;
        }
        postVital("CLS", cls);
      });
      layout.observe({ type: "layout-shift", buffered: true });
      observers.push(layout);
    } catch {
      // Unsupported in this browser.
    }

    try {
      const inp = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const event = entry as PerformanceEntry & { duration?: number; interactionId?: number };
          if (event.interactionId) postVital("INP", event.duration ?? 0);
        }
      });
      inp.observe({ type: "event", buffered: true, durationThreshold: 40 } as PerformanceObserverInit);
      observers.push(inp);
    } catch {
      // Unsupported in this browser.
    }

    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (nav) {
      postVital("TTFB", nav.responseStart);
      if (nav.loadEventEnd) postVital("FCP", nav.domContentLoadedEventEnd);
    }

    return () => {
      for (const observer of observers) observer.disconnect();
    };
  }, []);

  return null;
}
