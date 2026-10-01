import type { Metadata } from "next";
import { LandingPageView } from "@/components/marketing/landing-page-view";
import { JsonLd } from "@/components/seo/json-ld";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  buildFaqJsonLd,
  buildSoftwareApplicationJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} — ${SITE_TAGLINE}` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

export default function LandingPage() {
  return (
    <>
      <JsonLd data={buildSoftwareApplicationJsonLd()} />
      <JsonLd data={buildFaqJsonLd()} />
      <LandingPageView />
    </>
  );
}
