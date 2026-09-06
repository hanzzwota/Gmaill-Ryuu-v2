import { createFileRoute } from "@tanstack/react-router";
import { NeoCard, SectionTitle } from "@/components/neo";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — S3L RYU88 GMAIL" },
      { name: "description", content: "Panel administrasi." },
      { property: "og:title", content: "Admin — S3L RYU88 GMAIL" },
      { property: "og:description", content: "Panel administrasi." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-5">
      <SectionTitle title="Admin" subtitle="Panel administrasi." />
      <NeoCard>
        <p className="text-sm font-medium text-muted-foreground">
          Halaman ini sedang disiapkan.
        </p>
      </NeoCard>
    </div>
  );
}
