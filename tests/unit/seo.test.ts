import { describe, expect, it } from "vitest";
import {
  FAQ_ITEMS,
  PUBLIC_INDEXABLE_PATHS,
  absoluteUrl,
  buildFaqJsonLd,
  buildOrganizationJsonLd,
  buildSoftwareApplicationJsonLd,
  buildWebsiteJsonLd,
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
});
