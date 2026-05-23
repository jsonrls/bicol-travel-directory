import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | BicolStay",
  description:
    "Reach BicolStay for listing corrections, partnership questions, editorial feedback, and travel directory suggestions.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 lg:px-8">
      <header className="border-b border-border/60 pb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">
          Reach BicolStay
        </span>
        <h1 className="mt-2 font-serif text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
          Contact Us
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
          For listing updates, corrections, local recommendations, or editorial partnerships, send
          us a note and we&apos;ll review it as soon as we can.
        </p>
      </header>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1.3fr_0.9fr]">
        <section className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h2 className="font-serif text-2xl font-bold text-primary">How to Reach Us</h2>
          <p className="mt-3 text-base leading-relaxed text-foreground/90">
            The fastest way to get in touch is by email. If you&apos;re requesting a listing change,
            please include the property name, the detail that needs updating, and a source we can
            verify.
          </p>

          <div className="mt-6 space-y-4">
            <a
              href="mailto:hello@bicolstay.com"
              className="flex items-center gap-3 rounded-2xl border border-border bg-background px-5 py-4 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              <Mail className="h-4 w-4" />
              hello@bicolstay.com
            </a>
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-5 py-4 text-sm text-foreground/90">
              <MapPin className="h-4 w-4 text-accent" />
              Based in the Philippines, focused on the Bicol region
            </div>
          </div>
        </section>

        <aside className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h2 className="font-serif text-2xl font-bold text-primary">Common Requests</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-foreground/90">
            <li>Listing corrections for pricing, contact information, or amenities</li>
            <li>Suggestions for new hotels, resorts, beaches, and staycations</li>
            <li>Editorial partnerships or tourism feature ideas</li>
            <li>Questions about our guides and regional travel recommendations</li>
          </ul>

          <div className="mt-6 rounded-2xl bg-secondary/5 p-5">
            <p className="text-sm leading-relaxed text-secondary-foreground">
              Looking for trip ideas first? Browse the latest stories in our{" "}
              <Link href="/guides" className="font-semibold text-accent hover:underline">
                travel guides
              </Link>
              .
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
