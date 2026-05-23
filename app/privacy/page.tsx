import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | BicolStay",
  description:
    "Read how BicolStay handles visitor information, third-party links, and basic analytics for the travel directory experience.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12 lg:px-8">
      <header className="border-b border-border/60 pb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">
          BicolStay Policy
        </span>
        <h1 className="mt-2 font-serif text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
          This page explains what limited information may be collected when you browse BicolStay
          and how we handle outbound travel and booking links.
        </p>
      </header>

      <div className="mt-10 space-y-8">
        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-primary">Information We Collect</h2>
          <p className="text-base leading-relaxed text-foreground/90">
            BicolStay is a lightweight travel directory. We may collect basic analytics such as
            page visits, device type, and referral sources to understand which destinations and
            guides are most useful to readers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-primary">How Information Is Used</h2>
          <p className="text-base leading-relaxed text-foreground/90">
            Any collected data is used to improve the directory experience, maintain site
            performance, and prioritize which destinations, guides, and trip-planning resources to
            expand.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-primary">Third-Party Links</h2>
          <p className="text-base leading-relaxed text-foreground/90">
            Property websites, social pages, map services, and booking contact links on BicolStay
            lead to third-party destinations. Those services have their own privacy practices, so
            we recommend reviewing them before sharing personal or payment information.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-primary">Updates</h2>
          <p className="text-base leading-relaxed text-foreground/90">
            This policy may be revised as the directory grows, adds forms, or introduces new
            traveler tools. Material changes should be reflected on this page.
          </p>
        </section>
      </div>
    </div>
  );
}
