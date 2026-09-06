import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import { NeoButton, NeoCard, NeoInput, NeoLabel } from "@/components/neo";
import { useAuth } from "@/hooks/useAuth";

type AuthSearch = { mode?: "login" | "register" };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    mode: search["mode"] === "register" ? "register" : "login",
  }),
  head: () => ({
    meta: [
      { title: "Masuk atau Daftar — S3L RYU88 GMAIL" },
      {
        name: "description",
        content: "Masuk ke dashboard S3L RYU88 GMAIL untuk stor akun, cek saldo, dan tarik dana.",
      },
      { property: "og:title", content: "Masuk atau Daftar — S3L RYU88 GMAIL" },
      {
        property: "og:description",
        content: "Akses dashboard setoran, saldo, dan penarikan S3L RYU88 GMAIL.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [isRegister, setIsRegister] = useState(mode === "register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/dashboard" });
  }, [loading, session, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { username: username || email.split("@")[0], whatsapp },
          },
        });
        if (error) throw error;
        toast.success("Pendaftaran berhasil. Silakan masuk.");
        setIsRegister(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Selamat datang kembali!");
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Gagal masuk dengan Google.");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="neo-heading mb-5 block text-center text-xl">
          S3L RYU88 GMAIL
        </Link>
        <NeoCard className="border-[4px] p-6 shadow-neo-lg">
          <h1 className="neo-heading text-2xl">{isRegister ? "Daftar Akun" : "Masuk"}</h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            {isRegister
              ? "Buat akun untuk mulai menyetor."
              : "Masuk untuk melanjutkan ke dashboard."}
          </p>

          <form onSubmit={submit} className="mt-5 space-y-3">
            {isRegister ? (
              <>
                <div>
                  <NeoLabel>Nama Pengguna</NeoLabel>
                  <NeoInput
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ryu88"
                    required
                  />
                </div>
                <div>
                  <NeoLabel>Nomor WhatsApp</NeoLabel>
                  <NeoInput
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
              </>
            ) : null}
            <div>
              <NeoLabel>Email</NeoLabel>
              <NeoInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
              />
            </div>
            <div>
              <NeoLabel>Password</NeoLabel>
              <NeoInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                minLength={6}
                required
              />
            </div>
            <NeoButton type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? "Memproses..." : isRegister ? "Daftar Sekarang" : "Masuk"}
            </NeoButton>
          </form>

          <div className="my-4 flex items-center gap-3">
            <div className="h-[3px] flex-1 bg-ink" />
            <span className="font-display text-xs font-bold uppercase">atau</span>
            <div className="h-[3px] flex-1 bg-ink" />
          </div>

          <NeoButton tone="neutral" size="lg" className="w-full" onClick={google} disabled={busy}>
            Lanjut dengan Google
          </NeoButton>

          <button
            type="button"
            onClick={() => setIsRegister((v) => !v)}
            className="mt-4 w-full text-center text-sm font-bold underline"
          >
            {isRegister ? "Sudah punya akun? Masuk" : "Belum punya akun? Daftar"}
          </button>
        </NeoCard>

        <p className="mt-4 text-center text-xs font-bold uppercase text-muted-foreground">
          Kami tidak pernah meminta password / OTP akun pihak ketiga.
        </p>
      </div>
    </div>
  );
}
