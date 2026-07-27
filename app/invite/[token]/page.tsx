import { InviteRedeemClient } from "@/components/invite/invite-redeem-client";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <InviteRedeemClient token={token} />;
}
