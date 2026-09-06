import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  NeoCard,
  NeoButton,
  NeoInput,
  NeoTextarea,
  NeoLabel,
  NeoBadge,
  SectionTitle,
  formatRp,
} from "@/components/neo";
import { useBootstrap } from "@/components/AppShell";
import { submitAccounts, type SubmitResult } from "@/lib/submissions.functions";

export const Route = createFileRoute("/_authenticated/stor-akun")({
  head: () => ({
    meta: [
      { title: "Stor Akun — S3L RYU88 GMAIL" },
      { name: "description", content: "Kirim setoran akun satuan atau massal untuk direview admin." },
      { property: "og:title", content: "Stor Akun — S3L RYU88 GMAIL" },
      { property: "og:description", content: "Kirim setoran akun untuk direview admin." },
    ],
  }),
  component: StorAkunPage,
});

function StorAkunPage() {
  const { data: boot } = useBootstrap();
  const qc = useQueryClient();
  const [raw, setRaw] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<SubmitResult | null>(null);

  const mutation = useMutation({
    mutationFn: (vars: { raw: string; password: string }) => submitAccounts({ data: vars }),
    onSuccess: (res) => {
      setResult(res);
      setRaw("");
      toast.success(res.message);
      qc.invalidateQueries();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const lines = raw.split(/\r?\n/).filter((l) => l.trim()).length;
  const open = boot?.settings.submission_open ?? false;

  return (
    <div className="space-y-5">
      <SectionTitle title="Stor Akun" subtitle="Satu baris = satu akun. Format wajib benar." />

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <NeoCard>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <NeoBadge tone={open ? "primary" : "danger"}>
              {open ? "Setoran Buka" : "Setoran Tutup"}
            </NeoBadge>
            <NeoBadge tone="info">Sisa kuota: {boot?.quota.remaining ?? 0}</NeoBadge>
            <NeoBadge>Maks {boot?.settings.max_bulk ?? 25} baris</NeoBadge>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate({ raw, password });
            }}
            className="space-y-3"
          >
            <div>
              <NeoLabel>Data Setoran</NeoLabel>
              <NeoTextarea
                rows={10}
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                placeholder={"nama@gmail.com | kode_referensi\nnama2@gmail.com | kode_referensi2"}
                required
              />
              <p className="mt-1 text-xs font-bold uppercase text-muted-foreground">
                {lines} baris terdeteksi
              </p>
            </div>
            <div>
              <NeoLabel>Password Setoran</NeoLabel>
              <NeoInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password dari admin"
                required
              />
            </div>
            <NeoButton type="submit" size="lg" disabled={!open || mutation.isPending}>
              {mutation.isPending ? "Mengirim..." : "Kirim Setoran"}
            </NeoButton>
          </form>
        </NeoCard>

        <div className="space-y-4">
          <NeoCard className="bg-foreground text-background">
            <p className="font-display text-xs font-bold uppercase tracking-widest opacity-70">
              Rate per akun disetujui
            </p>
            <p className="neo-heading mt-1 text-3xl text-primary">
              {formatRp(boot?.settings.rate_per_account ?? 0)}
            </p>
          </NeoCard>

          <NeoCard>
            <h2 className="neo-heading text-base">Aturan Format</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm font-medium text-muted-foreground">
              <li>Format: email | kode_referensi</li>
              <li>Duplikat otomatis ditolak sistem</li>
              <li>Jangan pernah kirim password / OTP akun</li>
              <li>Kuota harian berlaku per pengguna</li>
            </ul>
          </NeoCard>

          {result ? (
            <NeoCard>
              <h2 className="neo-heading text-base">Hasil Setoran Terakhir</h2>
              <p className="mt-1 text-sm font-semibold">{result.message}</p>
              {result.duplicates.length ? (
                <p className="mt-2 break-words text-xs font-medium text-muted-foreground">
                  Duplikat: {result.duplicates.join(", ")}
                </p>
              ) : null}
              {result.invalid.length ? (
                <p className="mt-2 break-words text-xs font-medium text-muted-foreground">
                  Format salah: {result.invalid.join(" / ")}
                </p>
              ) : null}
            </NeoCard>
          ) : null}
        </div>
      </div>
    </div>
  );
}
