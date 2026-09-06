import { createFileRoute } from "@tanstack/react-router";
import { NeoCard, SectionTitle } from "@/components/neo";

export const Route = createFileRoute("/_authenticated/saldo")({
  head: () => ({
    meta: [
      { title: "Saldo & Withdraw — S3L RYU88 GMAIL" },
      { name: "description", content: "Kelola saldo dan penarikan." },
      { property: "og:title", content: "Saldo & Withdraw — S3L RYU88 GMAIL" },
      { property: "og:description", content: "Kelola saldo dan penarikan." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-5">
      <SectionTitle title="Saldo & Withdraw" subtitle="Kelola saldo dan penarikan." />
      <NeoCard>
        <p className="text-sm font-medium text-muted-foreground">
          Halaman ini sedang disiapkan.
        </p>
      </NeoCard>
    </div>
  );
}
