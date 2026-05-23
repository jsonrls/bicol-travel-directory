import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use | BicolStay",
  description:
    "Read the general terms for using BicolStay, including content accuracy, directory usage, and external booking links.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12 lg:px-8">
      <header className="border-b border-border/60 pb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">
          BicolStay Policy
        </span>
        <h1 className="mt-2 font-serif text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
          Terms of Use
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
          These terms describe the general conditions for browsing and using the BicolStay travel
          directory and related editorial content.
        </p>
      </header>

      <div className="mt-10 space-y-8">
        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-primary">Directory Use</h2>
          <p className="text-base leading-relaxed text-foreground/90">
            BicolStay is intended for travel research and inspiration. Listings, descriptions,
            images, pricing guidance, and local tips are presented for general informational
            purposes and may change without notice.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-primary">Availability and Accuracy</h2>
          <p className="text-base leading-relaxed text-foreground/90">
            We aim to keep destination details accurate and current, but travelers should confirm
            rates, transport arrangements, house rules, and seasonal conditions directly with the
            property or operator before making plans.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-primary">External Services</h2>
          <p className="text-base leading-relaxed text-foreground/90">
            BicolStay may link to third-party websites, map providers, and social platforms. We do
            not control those services and are not responsible for their content, policies, or
            booking outcomes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-primary">Intellectual Property</h2>
          <p className="text-base leading-relaxed text-foreground/90">
            Site copy, layout, and editorial presentation belong to BicolStay unless otherwise
            noted. Property names, logos, and photographs remain the property of their respective
            owners.
          </p>
        </section>
      </div>
    </div>
  );
}
