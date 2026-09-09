import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, BookLock, Send } from "lucide-react";
import {
  NeoCard,
  NeoButton,
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
      { name: "description", content: "Kirim setoran Gmail massal untuk direview admin." },
      { property: "og:title", content: "Stor Akun — S3L RYU88 GMAIL" },
      { property: "og:description", content: "Kirim setoran Gmail untuk direview admin." },
    ],
  }),
  component: StorAkunPage,
});

function StorAkunPage() {
  const { data: boot } = useBootstrap();
  const qc = useQueryClient();
  const [raw, setRaw] = useState("");
  const [result, setResult] = useState<SubmitResult | null>(null);

  const mutation = useMutation({
    mutationFn: (vars: { raw: string }) => submitAccounts({ data: vars }),
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
    <div className="space-y-4">
      {!open ? (
        <div className="flex items-start gap-3 rounded-md border-[3px] border-ink bg-warning px-3 py-2 text-warning-foreground shadow-neo">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-display text-sm font-bold uppercase">Setoran sedang ditutup</p>
            <p className="text-xs font-semibold opacity-80">
              {boot?.settings.announcement}
            </p>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border-[3px] border-ink bg-accent px-3 py-2 text-accent-foreground shadow-neo">
        <div className="flex items-start gap-3">
          <BookLock className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-display text-sm font-bold uppercase">
              Cek Rules dulu sebelum stor
            </p>
            <p className="text-xs font-semibold opacity-80">
              Wajib dibaca agar Gmail tidak ditolak.
            </p>
          </div>
        </div>
        <Link to="/rules">
          <NeoButton size="sm">Buka Rules</NeoButton>
        </Link>
      </div>

      <SectionTitle
        title="Setor Daftar Gmail"
        subtitle="Tempel daftar, satu Gmail per baris. Duplikat otomatis dihapus."
      />

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
              mutation.mutate({ raw });
            }}
            className="space-y-3"
          >
            <div>
              <NeoLabel>Daftar Gmail</NeoLabel>
              <NeoTextarea
                rows={12}
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                placeholder={"contoh1@gmail.com\ncontoh2@gmail.com"}
                required
              />
              <p className="mt-1 text-xs font-bold uppercase text-muted-foreground">
                {lines} baris terdeteksi
              </p>
            </div>
            <NeoButton
              type="submit"
              size="lg"
              className="w-full"
              disabled={!open || mutation.isPending}
            >
              <Send className="size-4" />
              {mutation.isPending ? "Mengirim..." : "Stor Sekarang"}
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
            <h2 className="neo-heading text-base">Rules Hari Ini</h2>
            <p className="mt-2 whitespace-pre-line text-sm font-medium text-muted-foreground">
              {boot?.settings.rules_today}
            </p>
          </NeoCard>

          <NeoCard>
            <h2 className="neo-heading text-base">Aturan Format</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm font-medium text-muted-foreground">
              <li>Satu email Gmail per baris, tanpa tambahan apa pun</li>
              <li>Duplikat otomatis ditolak sistem</li>
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
