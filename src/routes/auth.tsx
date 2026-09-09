import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import { NeoButton, NeoCard, NeoInput, NeoLabel } from "@/components/neo";
import { useAuth } from "@/hooks/useAuth";
import { resolveLoginEmail } from "@/lib/auth.functions";

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
  const [ready, setReady] = useState(false);
  const [authError, setAuthError] = useState("");
  const [notRegistered, setNotRegistered] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    setIsRegister(mode === "register");
  }, [mode]);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/dashboard", replace: true });
  }, [loading, session, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setAuthError("");
    setNotRegistered(false);
    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { username: username || email.split("@")[0], whatsapp },
          },
        });
        if (error) {
          if ("code" in error && error.code === "user_already_exists") {
            throw new Error("Email sudah terdaftar. Silakan masuk.");
          }
          throw error;
        }
        if (data.session) {
          toast.success("Pendaftaran berhasil. Selamat datang!");
          navigate({ to: "/dashboard" });
        } else {
          toast.success("Pendaftaran berhasil. Silakan masuk.");
          setIsRegister(false);
        }
      } else {
        const identifier = email.trim();
        const found = identifier.includes("@")
          ? { found: true as const, email: identifier, suspended: false }
          : await resolveLoginEmail({ data: { identifier } });
        if (!found.found) {
          setNotRegistered(true);
          throw new Error(
            "Akun tidak terdaftar. Periksa username / Gmail kamu, atau daftar sekarang.",
          );
        }
        if (found.suspended) {
          throw new Error("Akun kamu sedang dibekukan. Hubungi admin.");
        }
        const { error } = await supabase.auth.signInWithPassword({
          email: found.email,
          password,
        });
        if (error) {
          if ("code" in error && error.code === "email_not_confirmed") {
            throw new Error("Email belum dikonfirmasi. Cek kotak masuk email kamu.");
          }
          if ("code" in error && error.code === "invalid_credentials") {
            throw new Error("Password salah untuk akun ini.");
          }
          if ("code" in error && error.code === "invalid_login_credentials") {
            throw new Error("Username/email atau password salah.");
          }
          throw error;
        }
        toast.success("Selamat datang kembali!");
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan. Silakan coba lagi.";
      setAuthError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const openRegistration = () => {
    const identifier = email.trim();
    if (identifier.includes("@")) {
      setEmail(identifier);
      setUsername("");
    } else {
      setUsername(identifier);
      setEmail("");
    }
    setAuthError("");
    setNotRegistered(false);
    navigate({ to: "/auth", search: { mode: "register" } });
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
                    placeholder=""
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
              <NeoLabel>{isRegister ? "Email" : "Username / Gmail"}</NeoLabel>
              <NeoInput
                type={isRegister ? "email" : "text"}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setAuthError("");
                  setNotRegistered(false);
                }}
                placeholder=""
                autoComplete="username"
                required
              />
            </div>
            <div>
              <NeoLabel>Password</NeoLabel>
              <NeoInput
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setAuthError("");
                }}
                placeholder="Minimal 8 karakter"
                minLength={8}
                required
              />
            </div>
            <NeoButton type="submit" size="lg" className="w-full" disabled={busy || !ready}>
              {busy || !ready ? "Memproses..." : isRegister ? "Daftar Sekarang" : "Masuk"}
            </NeoButton>
          </form>

          {authError ? (
            <div
              role="alert"
              className="mt-4 rounded-md border-[3px] border-ink bg-destructive px-3 py-2 text-sm font-bold text-destructive-foreground shadow-neo-sm"
            >
              {authError}
            </div>
          ) : null}

          {!isRegister && notRegistered ? (
            <button
              type="button"
              onClick={openRegistration}
              className="mt-3 w-full text-center text-sm font-bold underline"
            >
              Daftar Sekarang
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => {
              if (isRegister) {
                setIsRegister(false);
                navigate({ to: "/auth", search: { mode: "login" } });
              } else {
                openRegistration();
              }
            }}
            className="mt-4 w-full text-center text-sm font-bold underline"
          >
            {isRegister ? "Sudah punya akun? Masuk" : "Belum punya akun? Daftar"}
          </button>
        </NeoCard>

        <p className="mt-4 text-center text-xs font-bold uppercase text-muted-foreground">
          Setorkan Gmail Mu Sekarang Juga
        </p>
      </div>
    </div>
  );
}
