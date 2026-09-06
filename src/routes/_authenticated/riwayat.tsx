import { createFileRoute } from "@tanstack/react-router";
import { NeoCard, SectionTitle } from "@/components/neo";

export const Route = createFileRoute("/_authenticated/riwayat")({
  head: () => ({
    meta: [
      { title: "Riwayat Setoran — S3L RYU88 GMAIL" },
      { name: "description", content: "Pantau status setoran Anda." },
      { property: "og:title", content: "Riwayat Setoran — S3L RYU88 GMAIL" },
      { property: "og:description", content: "Pantau status setoran Anda." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-5">
      <SectionTitle title="Riwayat Setoran" subtitle="Pantau status setoran Anda." />
      <NeoCard>
        <p className="text-sm font-medium text-muted-foreground">
          Halaman ini sedang disiapkan.
        </p>
      </NeoCard>
    </div>
  );
}
