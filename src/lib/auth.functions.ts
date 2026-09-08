import { createServerFn } from "@tanstack/react-start";

/**
 * Cek apakah akun (username atau email) terdaftar, lalu kembalikan email
 * yang dipakai untuk proses masuk.
 */
export const resolveLoginEmail = createServerFn({ method: "POST" })
  .inputValidator((data: { identifier: string }) => data)
  .handler(async ({ data }) => {
    const raw = data.identifier.trim();
    if (raw.length < 3 || raw.length > 254) {
      return { found: false as const };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const column = raw.includes("@") ? "email" : "username";
    const { data: row } = await supabaseAdmin
      .from("profiles")
      .select("email, username, suspended")
      .ilike(column, raw)
      .limit(1)
      .maybeSingle();

    if (!row?.email) return { found: false as const };
    return { found: true as const, email: row.email, suspended: row.suspended };
  });
