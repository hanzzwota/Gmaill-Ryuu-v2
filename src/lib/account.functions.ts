import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Bootstrap = {
  profile: {
    id: string;
    username: string;
    email: string | null;
    whatsapp: string | null;
    payment_method: string | null;
    payment_account: string | null;
    suspended: boolean;
  } | null;
  isAdmin: boolean;
  settings: {
    dashboard_name: string;
    rate_per_account: number;
    daily_quota: number;
    max_bulk: number;
    min_withdrawal: number;
    submission_open: boolean;
    whatsapp_link: string;
    announcement: string;
    human_support_enabled: boolean;
    ai_faq_enabled: boolean;
  };
  balance: {
    available: number;
    pending: number;
    totalEarned: number;
    totalWithdrawn: number;
  };
  quota: { used: number; limit: number; remaining: number };
  stats: { accepted: number; pending: number; rejected: number; total: number };
};

export const getBootstrap = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Bootstrap> => {
    const { supabase, userId } = context;

    const [profileRes, roleRes, settingsRes, ledgerRes, subsRes, paidRes] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
        supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
        supabase.from("balance_transactions").select("type, amount").eq("user_id", userId),
        supabase.from("submissions").select("status, rate, created_at").eq("user_id", userId),
        supabase
          .from("withdrawals")
          .select("amount")
          .eq("user_id", userId)
          .eq("status", "PAID"),
      ]);

    const ledger = ledgerRes.data ?? [];
    const available = ledger.reduce((sum, t) => sum + t.amount, 0);
    const totalEarned = ledger
      .filter((t) => t.type === "CREDIT")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalWithdrawn = (paidRes.data ?? []).reduce((sum, w) => sum + w.amount, 0);


    const subs = subsRes.data ?? [];
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const used = subs.filter((s) => new Date(s.created_at) >= today).length;
    const pendingSubs = subs.filter((s) => s.status === "PENDING");

    const settings = settingsRes.data;
    const limit = settings?.daily_quota ?? 0;

    return {
      profile: profileRes.data ?? null,
      isAdmin: roleRes.data === true,
      settings: {
        dashboard_name: settings?.dashboard_name ?? "S3L RYU88 GMAIL",
        rate_per_account: settings?.rate_per_account ?? 0,
        daily_quota: limit,
        max_bulk: settings?.max_bulk ?? 25,
        min_withdrawal: settings?.min_withdrawal ?? 4000,
        submission_open: settings?.submission_open ?? false,
        whatsapp_link: settings?.whatsapp_link ?? "",
        announcement: settings?.announcement ?? "",
        human_support_enabled: settings?.human_support_enabled ?? true,
        ai_faq_enabled: settings?.ai_faq_enabled ?? true,
      },
      balance: {
        available,
        pending: pendingSubs.reduce((sum, s) => sum + s.rate, 0),
        totalEarned,
        totalWithdrawn: ledger
          .filter((t) => t.type === "PAYOUT")
          .reduce((sum, t) => sum + Math.abs(t.amount), 0) || totalWithdrawn * 0,
      },
      quota: { used, limit, remaining: Math.max(0, limit - used) },
      stats: {
        accepted: subs.filter((s) => s.status === "ACCEPTED").length,
        pending: pendingSubs.length,
        rejected: subs.filter((s) => s.status === "REJECTED").length,
        total: subs.length,
      },
    };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    username: string;
    whatsapp: string;
    payment_method: string;
    payment_account: string;
  }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (!data.username.trim()) throw new Error("Nama pengguna wajib diisi.");
    const { error } = await supabase
      .from("profiles")
      .update({
        username: data.username.trim(),
        whatsapp: data.whatsapp.trim() || null,
        payment_method: data.payment_method.trim() || null,
        payment_account: data.payment_account.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("balance_transactions")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });
