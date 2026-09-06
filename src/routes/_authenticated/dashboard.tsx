import { createFileRoute } from "@tanstack/react-router";
import { NeoCard, SectionTitle } from "@/components/neo";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — S3L RYU88 GMAIL" },
      {
        name: "description",
        content: "Ringkasan setoran, kuota harian, saldo, dan penarikan akun Anda.",
      },
      { property: "og:title", content: "Dashboard — S3L RYU88 GMAIL" },
      {
        property: "og:description",
        content: "Pantau setoran, kuota, saldo, dan penarikan dalam satu halaman.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="space-y-5">
      <SectionTitle title="Dashboard" subtitle="Ringkasan aktivitas akun Anda." />
      <NeoCard>
        <p className="text-sm font-medium text-muted-foreground">
          Halaman ini sedang disiapkan. Menu setoran, saldo, dan support menyusul.
        </p>
      </NeoCard>
    </div>
  );
}
