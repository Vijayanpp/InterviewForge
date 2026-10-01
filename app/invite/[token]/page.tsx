import type { Metadata } from "next";
import { InviteRedeemClient } from "@/components/invite/invite-redeem-client";
import { noIndexRobots } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Assessment invite",
  robots: noIndexRobots,
};

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <InviteRedeemClient token={token} />;
}
