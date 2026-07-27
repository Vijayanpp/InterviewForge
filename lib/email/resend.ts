import "server-only";
import { Resend } from "resend";
import { getServerEnv } from "@/lib/env";
import { logger } from "@/lib/logger";

export async function sendAssessmentInviteEmail(input: {
  to: string;
  organizationName: string;
  assessmentTitle: string;
  jobRole?: string | null;
  durationMinutes: number;
  expiresAt?: string | null;
  inviteUrl: string;
}): Promise<{ sent: boolean; id?: string }> {
  const env = getServerEnv();
  const subject = `Interview invite: ${input.assessmentTitle}`;
  const expiryLine = input.expiresAt
    ? `<p>This invite expires on <strong>${new Date(input.expiresAt).toLocaleString()}</strong>.</p>`
    : "";
  const html = `
    <div style="font-family: system-ui, sans-serif; line-height: 1.5; color: #0f172a;">
      <h2>${input.organizationName} invited you to an interview</h2>
      <p><strong>${input.assessmentTitle}</strong>${input.jobRole ? ` — ${input.jobRole}` : ""}</p>
      <p>Duration: about ${input.durationMinutes} minutes. This is a proctored AI interview (camera + screen recording required).</p>
      ${expiryLine}
      <p><a href="${input.inviteUrl}" style="display:inline-block;padding:12px 20px;background:#ea580c;color:#fff;text-decoration:none;border-radius:8px;">Start assessment</a></p>
      <p style="font-size:12px;color:#64748b;">If the button does not work, open: ${input.inviteUrl}</p>
    </div>
  `;

  if (!env.RESEND_API_KEY) {
    logger.info(
      { to: input.to, inviteUrl: input.inviteUrl },
      "RESEND_API_KEY unset — invite email skipped"
    );
    return { sent: false };
  }

  const resend = new Resend(env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: input.to,
    subject,
    html,
  });

  if (error) {
    logger.error({ err: error, to: input.to }, "Failed to send invite email");
    throw new Error(error.message);
  }

  return { sent: true, id: data?.id };
}
