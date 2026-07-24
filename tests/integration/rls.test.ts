import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Database } from "@/types/database";
import { getServerEnv } from "@/lib/env";

/**
 * RLS integration test: verifies that a candidate can never read another
 * candidate's interview session, at the database level, regardless of
 * what the application layer does. Runs against a real local Supabase
 * instance (`supabase start`) — never against production.
 */

const TEST_PASSWORD = "Test-Password-123!";

function anonClient(): SupabaseClient<Database> {
  const env = getServerEnv();
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

describe("RLS: interview_sessions candidate isolation", () => {
  const suffix = randomUUID().slice(0, 8);
  const candidateAEmail = `rls-test-a-${suffix}@interviewforge.test`;
  const candidateBEmail = `rls-test-b-${suffix}@interviewforge.test`;

  const admin = createClient<Database>(
    getServerEnv().NEXT_PUBLIC_SUPABASE_URL,
    getServerEnv().SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  let candidateAId: string;
  let candidateBId: string;
  let technologyId: string;
  let sessionId: string;
  let clientA: SupabaseClient<Database>;
  let clientB: SupabaseClient<Database>;

  beforeAll(async () => {
    const { data: userA, error: userAError } = await admin.auth.admin.createUser({
      email: candidateAEmail,
      password: TEST_PASSWORD,
      email_confirm: true,
    });
    if (userAError || !userA.user) throw userAError ?? new Error("Failed to create candidate A");
    candidateAId = userA.user.id;

    const { data: userB, error: userBError } = await admin.auth.admin.createUser({
      email: candidateBEmail,
      password: TEST_PASSWORD,
      email_confirm: true,
    });
    if (userBError || !userB.user) throw userBError ?? new Error("Failed to create candidate B");
    candidateBId = userB.user.id;

    const { data: technology, error: technologyError } = await admin
      .from("technologies")
      .select("id")
      .eq("slug", "javascript")
      .single();
    if (technologyError || !technology) throw technologyError ?? new Error("Seed technology not found");
    technologyId = technology.id;

    clientA = anonClient();
    const { error: signInAError } = await clientA.auth.signInWithPassword({
      email: candidateAEmail,
      password: TEST_PASSWORD,
    });
    if (signInAError) throw signInAError;

    clientB = anonClient();
    const { error: signInBError } = await clientB.auth.signInWithPassword({
      email: candidateBEmail,
      password: TEST_PASSWORD,
    });
    if (signInBError) throw signInBError;

    const { data: session, error: sessionError } = await clientA
      .from("interview_sessions")
      .insert({
        candidate_id: candidateAId,
        interview_type: "technical",
        technology_ids: [technologyId],
        experience_level: "mid",
        duration_minutes: 30,
        status: "in_progress",
      })
      .select("id")
      .single();
    if (sessionError || !session) throw sessionError ?? new Error("Failed to create session as candidate A");
    sessionId = session.id;
  });

  afterAll(async () => {
    await admin.from("interview_sessions").delete().eq("id", sessionId);
    await admin.auth.admin.deleteUser(candidateAId);
    await admin.auth.admin.deleteUser(candidateBId);
  });

  it("lets candidate A read their own session", async () => {
    const { data, error } = await clientA
      .from("interview_sessions")
      .select("id, candidate_id")
      .eq("id", sessionId)
      .single();

    expect(error).toBeNull();
    expect(data?.candidate_id).toBe(candidateAId);
  });

  it("hides candidate A's session from candidate B", async () => {
    const { data, error } = await clientB
      .from("interview_sessions")
      .select("id")
      .eq("id", sessionId);

    // RLS filters the row out silently rather than erroring — the request
    // succeeds but returns zero rows, which is the behaviour we're asserting.
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("prevents candidate B from inserting a session on candidate A's behalf", async () => {
    const { error } = await clientB.from("interview_sessions").insert({
      candidate_id: candidateAId,
      interview_type: "technical",
      technology_ids: [technologyId],
      experience_level: "mid",
      duration_minutes: 30,
      status: "draft",
    });

    expect(error).not.toBeNull();
  });

  it("prevents candidate B from updating candidate A's session", async () => {
    const { data, error } = await clientB
      .from("interview_sessions")
      .update({ status: "abandoned" })
      .eq("id", sessionId)
      .select("id");

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });
});
