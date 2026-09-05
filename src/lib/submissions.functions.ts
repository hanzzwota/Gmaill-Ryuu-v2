import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type SubmitResult = {
  accepted: number;
  duplicates: string[];
  invalid: string[];
  skippedQuota: string[];
  message: string;
};

const LINE_RE = /^([^\s|@]+@[^\s|@]+\.[^\s|@]+)\s*\|\s*([A-Za-z0-9_\-.]{3,64})$/;

export const submitAccounts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { raw: string; password: string }) => data)
  .handler(async ({ data, context }): Promise<SubmitResult> => {
    const { supabase, userId } = context;

    const [profileRes, settingsRes, pwRes] = await Promise.all([
      supabase.from("profiles").select("suspended").eq("id", userId).maybeSingle(),
      supabase
        .from("settings")
        .select("rate_per_account, daily_quota, max_bulk, submission_open")
        .eq("id", 1)
        .maybeSingle(),
      supabase.rpc("check_deposit_password", { _password: data.password.trim() }),
    ]);

    if (profileRes.data?.suspended) throw new Error("Akun Anda sedang ditangguhkan.");
    const settings = settingsRes.data;
    if (!settings) throw new Error("Pengaturan sistem tidak ditemukan.");
    if (!settings.submission_open) throw new Error("Setoran sedang DITUTUP oleh admin.");
    if (pwRes.data !== true) throw new Error("Password setoran salah.");

    const lines = data.raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) throw new Error("Tidak ada data setoran.");
    if (lines.length > settings.max_bulk)
      throw new Error(`Maksimal ${settings.max_bulk} baris per setoran.`);

    const invalid: string[] = [];
    const parsed: { ref: string; token: string }[] = [];
    const seen = new Set<string>();

    for (const line of lines) {
      const match = LINE_RE.exec(line);
      if (!match) {
        invalid.push(line);
        continue;
      }
      const ref = match[1]!.toLowerCase();
      if (seen.has(ref)) continue;
      seen.add(ref);
      parsed.push({ ref, token: match[2]! });
    }

    // Daily quota (UTC day boundary)
    const dayStart = new Date();
    dayStart.setUTCHours(0, 0, 0, 0);
    const { count } = await supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", dayStart.toISOString());

    const used = count ?? 0;
    const remaining = Math.max(0, settings.daily_quota - used);
    if (remaining === 0 && parsed.length > 0)
      throw new Error("Kuota harian Anda sudah habis.");

    const allowed = parsed.slice(0, remaining);
    const skippedQuota = parsed.slice(remaining).map((p) => p.ref);

    // Duplicate check against existing records
    const duplicates: string[] = [];
    const fresh: typeof allowed = [];
    if (allowed.length > 0) {
      const { data: existing } = await supabase
        .from("submissions")
        .select("account_ref")
        .in(
          "account_ref",
          allowed.map((a) => a.ref),
        );
      const taken = new Set((existing ?? []).map((e) => e.account_ref.toLowerCase()));
      for (const item of allowed) {
        if (taken.has(item.ref)) duplicates.push(item.ref);
        else fresh.push(item);
      }
    }

    let accepted = 0;
    if (fresh.length > 0) {
      const batchId = crypto.randomUUID();
      const { error, data: inserted } = await supabase
        .from("submissions")
        .insert(
          fresh.map((f) => ({
            user_id: userId,
            batch_id: batchId,
            account_ref: f.ref,
            internal_token: f.token,
            rate: settings.rate_per_account,
          })),
        )
        .select("id");
      if (error) {
        if (error.code === "23505") {
          duplicates.push(...fresh.map((f) => f.ref));
        } else {
          throw new Error(error.message);
        }
      } else {
        accepted = inserted?.length ?? 0;
      }
    }

    const parts = [`${accepted} akun masuk antrean review`];
    if (duplicates.length) parts.push(`${duplicates.length} duplikat`);
    if (invalid.length) parts.push(`${invalid.length} format salah`);
    if (skippedQuota.length) parts.push(`${skippedQuota.length} melebihi kuota`);

    return {
      accepted,
      duplicates,
      invalid,
      skippedQuota,
      message: parts.join(" • "),
    };
  });

export const listSubmissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("submissions")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });
