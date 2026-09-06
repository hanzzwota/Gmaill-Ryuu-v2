import { createFileRoute } from "@tanstack/react-router";
import { NeoCard, SectionTitle } from "@/components/neo";

export const Route = createFileRoute("/_authenticated/support")({
  head: () => ({
    meta: [
      { title: "Support AI — S3L RYU88 GMAIL" },
      { name: "description", content: "Tanya Carsloss atau buka tiket." },
      { property: "og:title", content: "Support AI — S3L RYU88 GMAIL" },
      { property: "og:description", content: "Tanya Carsloss atau buka tiket." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-5">
      <SectionTitle title="Support AI" subtitle="Tanya Carsloss atau buka tiket." />
      <NeoCard>
        <p className="text-sm font-medium text-muted-foreground">
          Halaman ini sedang disiapkan.
        </p>
      </NeoCard>
    </div>
  );
}
