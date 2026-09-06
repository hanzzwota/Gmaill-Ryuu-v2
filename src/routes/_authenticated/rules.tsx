import { createFileRoute } from "@tanstack/react-router";
import { NeoCard, SectionTitle } from "@/components/neo";

export const Route = createFileRoute("/_authenticated/rules")({
  head: () => ({
    meta: [
      { title: "Rules — S3L RYU88 GMAIL" },
      { name: "description", content: "Aturan dan ketentuan platform." },
      { property: "og:title", content: "Rules — S3L RYU88 GMAIL" },
      { property: "og:description", content: "Aturan dan ketentuan platform." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-5">
      <SectionTitle title="Rules" subtitle="Aturan dan ketentuan platform." />
      <NeoCard>
        <p className="text-sm font-medium text-muted-foreground">
          Halaman ini sedang disiapkan.
        </p>
      </NeoCard>
    </div>
  );
}
