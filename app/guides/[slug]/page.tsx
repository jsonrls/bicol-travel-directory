import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { getGuideBySlug, getGuides } from "../../../lib/db";

interface GuidePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const guides = await getGuides();

  return guides.map((guide) => ({
    slug: guide.slug,
  }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);

  if (!guide) {
    return {
      title: "Guide Not Found | BicolStay",
    };
  }

  return {
    title: `${guide.title} | BicolStay`,
    description: guide.excerpt,
    openGraph: {
      title: `${guide.title} | BicolStay`,
      description: guide.excerpt,
      url: `https://bicolstay.com/guides/${guide.slug}`,
      images: [{ url: guide.coverImage }],
    },
  };
}

function renderGuideContent(content: string) {
  return content.split("\n").map((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      return <div key={index} className="h-2" />;
    }

    if (trimmed.startsWith("### ")) {
      return (
        <h2 key={index} className="font-serif text-3xl font-bold tracking-tight text-primary">
          {trimmed.replace("### ", "")}
        </h2>
      );
    }

    if (trimmed.startsWith("#### ")) {
      return (
        <h3 key={index} className="font-serif text-2xl font-bold text-primary">
          {trimmed.replace("#### ", "")}
        </h3>
      );
    }

    if (/^\d+\.\s/.test(trimmed) || trimmed.startsWith("- ")) {
      return (
        <p key={index} className="pl-4 text-base leading-relaxed text-foreground/90">
          {trimmed.replace(/^\d+\.\s/, "").replace(/^- /, "• ")}
        </p>
      );
    }

    return (
      <p key={index} className="text-base leading-relaxed text-foreground/90">
        {trimmed.replace(/\*\*/g, "")}
      </p>
    );
  });
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  return (
    <article className="mx-auto w-full max-w-4xl px-6 py-12 lg:px-8">
      <Link
        href="/guides"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to guides
      </Link>

      <header className="mt-6 border-b border-border/60 pb-8">
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {guide.readTime}
          </span>
          <span>{guide.date}</span>
          <span>By {guide.author}</span>
        </div>
        <h1 className="mt-4 font-serif text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
          {guide.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
          {guide.excerpt}
        </p>
      </header>

      <div className="relative mt-8 overflow-hidden rounded-3xl bg-muted">
        <img src={guide.coverImage} alt={guide.title} className="h-full w-full object-cover" />
      </div>

      <div className="mt-10 space-y-5">{renderGuideContent(guide.content)}</div>

      <footer className="mt-12 border-t border-border/60 pt-6">
        <div className="flex flex-wrap gap-2">
          {guide.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary"
            >
              {tag}
            </span>
          ))}
        </div>
      </footer>
    </article>
  );
}
