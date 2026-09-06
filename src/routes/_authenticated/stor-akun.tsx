import { createFileRoute } from "@tanstack/react-router";
import { NeoCard, SectionTitle } from "@/components/neo";

export const Route = createFileRoute("/_authenticated/stor-akun")({
  head: () => ({
    meta: [
      { title: "Stor Akun — S3L RYU88 GMAIL" },
      { name: "description", content: "Kirim akun untuk direview." },
      { property: "og:title", content: "Stor Akun — S3L RYU88 GMAIL" },
      { property: "og:description", content: "Kirim akun untuk direview." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-5">
      <SectionTitle title="Stor Akun" subtitle="Kirim akun untuk direview." />
      <NeoCard>
        <p className="text-sm font-medium text-muted-foreground">
          Halaman ini sedang disiapkan.
        </p>
      </NeoCard>
    </div>
  );
}
