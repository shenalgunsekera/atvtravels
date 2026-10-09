"use client";

import Link from "next/link";
import { Section, TextField, TextArea } from "../ui";
import EditorFrame from "../EditorFrame";
import PageHeroFields from "./PageHeroFields";
import SectionHeadFields from "./SectionHeadFields";
import SeoFields from "./SeoFields";

const SECTIONS = [
  { id: "hero", label: "Banner" },
  { id: "intro", label: "Intro" },
  { id: "cards", label: "Package cards" },
  { id: "cta", label: "Bottom banner" },
  { id: "seo", label: "SEO" },
];

export default function PackagesPageEditor() {
  return (
    <EditorFrame
      title="Packages page"
      description="Text around your package listings. To add or edit packages themselves, use Packages."
      viewHref="/packages"
      sections={SECTIONS}
    >
      {(site, update) => {
        const p = site.packagesPage;
        return (
          <>
            <Section id="hero" title="Page banner">
              <PageHeroFields value={p.hero} onChange={(v) => update((d) => { d.packagesPage.hero = v; })} />
            </Section>

            <Section id="intro" title="Intro" description="Heading above the destination filter.">
              <SectionHeadFields value={p.intro} onChange={(v) => update((d) => { d.packagesPage.intro = v; })} />
            </Section>

            <Section id="cards" title="Package cards" description="Wording used on every package card.">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Price note" value={p.cardNote} onChange={(v) => update((d) => { d.packagesPage.cardNote = v; })} />
                <TextField label="Enquire button" value={p.enquireLabel} onChange={(v) => update((d) => { d.packagesPage.enquireLabel = v; })} />
              </div>
              <TextArea
                label="Message when a destination has no packages"
                value={p.emptyText}
                onChange={(v) => update((d) => { d.packagesPage.emptyText = v; })}
                rows={2}
              />
              <p className="rounded-lg bg-sky-50 px-3.5 py-2.5 text-[13px] text-sky-800">
                <Link href="/admin/packages" className="font-semibold underline underline-offset-2">Manage packages →</Link>
              </p>
            </Section>

            <Section
              id="cta"
              title="Call-to-action banner"
              visible={p.ctaVisible}
              onVisibleChange={(v) => update((d) => { d.packagesPage.ctaVisible = v; })}
            >
              <p className="text-[13px] text-gray-500">
                Shared with other pages. <Link href="/admin/settings#cta" className="font-semibold text-gold-dark underline underline-offset-2">Edit its text in Site settings →</Link>
              </p>
            </Section>

            <Section id="seo" title="Search engine listing">
              <SeoFields path="/packages" value={p.seo} onChange={(v) => update((d) => { d.packagesPage.seo = v; })} />
            </Section>
          </>
        );
      }}
    </EditorFrame>
  );
}
