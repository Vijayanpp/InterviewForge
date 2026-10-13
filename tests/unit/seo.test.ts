import { describe, expect, it } from "vitest";
import {
  FAQ_ITEMS,
  PRODUCTION_SITE_URL,
  PUBLIC_INDEXABLE_PATHS,
  absoluteUrl,
  buildFaqJsonLd,
  buildOrganizationJsonLd,
  buildSoftwareApplicationJsonLd,
  buildWebsiteJsonLd,
  getSiteUrl,
  noIndexRobots,
} from "@/lib/seo";

describe("SEO helpers", () => {
  it("keeps private app routes out of the public sitemap", () => {
    const paths = PUBLIC_INDEXABLE_PATHS.map((entry) => entry.path);
    expect(paths).toContain("/");
    expect(paths).toContain("/about");
    expect(paths).toContain("/privacy");
    expect(paths).not.toContain("/dashboard");
    expect(paths).not.toContain("/admin");
    expect(paths).not.toContain("/interviews");
  });

  it("builds valid JSON-LD graphs", () => {
    expect(buildOrganizationJsonLd()["@type"]).toBe("Organization");
    expect(buildWebsiteJsonLd()["@type"]).toBe("WebSite");
    expect(buildSoftwareApplicationJsonLd()["@type"]).toBe("SoftwareApplication");
    const faq = buildFaqJsonLd();
    expect(faq["@type"]).toBe("FAQPage");
    expect(faq.mainEntity).toHaveLength(FAQ_ITEMS.length);
  });

  it("marks authenticated surfaces as noindex", () => {
    expect(noIndexRobots.index).toBe(false);
    expect(noIndexRobots.follow).toBe(false);
  });

  it("resolves absolute URLs from APP_URL", () => {
    expect(absoluteUrl("/about")).toMatch(/\/about$/);
  });

  it("uses interviewforge.co.in when production APP_URL is missing or localhost", () => {
    const previousUrl = process.env.APP_URL;
    const previousEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = "production";
      process.env.APP_URL = "";
      expect(getSiteUrl()).toBe(PRODUCTION_SITE_URL);
      process.env.APP_URL = "http://localhost:3100";
      expect(getSiteUrl()).toBe(PRODUCTION_SITE_URL);
    } finally {
      process.env.NODE_ENV = previousEnv;
      if (previousUrl === undefined) {
        delete process.env.APP_URL;
      } else {
        process.env.APP_URL = previousUrl;
      }
    }
  });
});
