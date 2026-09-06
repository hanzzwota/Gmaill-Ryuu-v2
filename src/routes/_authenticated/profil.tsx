import { createFileRoute } from "@tanstack/react-router";
import { NeoCard, SectionTitle } from "@/components/neo";

export const Route = createFileRoute("/_authenticated/profil")({
  head: () => ({
    meta: [
      { title: "Profil — S3L RYU88 GMAIL" },
      { name: "description", content: "Kelola data akun Anda." },
      { property: "og:title", content: "Profil — S3L RYU88 GMAIL" },
      { property: "og:description", content: "Kelola data akun Anda." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-5">
      <SectionTitle title="Profil" subtitle="Kelola data akun Anda." />
      <NeoCard>
        <p className="text-sm font-medium text-muted-foreground">
          Halaman ini sedang disiapkan.
        </p>
      </NeoCard>
    </div>
  );
}
