"use client";

import Link from "next/link";
import { Section, TextField, TextArea } from "../ui";
import { MediaField } from "../media";
import { StringList, ObjectList } from "../lists";
import { IconPicker } from "../fields";
import EditorFrame from "../EditorFrame";
import PageHeroFields from "./PageHeroFields";
import SectionHeadFields from "./SectionHeadFields";
import SeoFields from "./SeoFields";

const SECTIONS = [
  { id: "hero", label: "Banner" },
  { id: "mission", label: "Our mission" },
  { id: "values", label: "Core values" },
  { id: "gallery", label: "Gallery" },
  { id: "cta", label: "Bottom banner" },
  { id: "seo", label: "SEO" },
];

export default function AboutEditor() {
  return (
    <EditorFrame title="About page" description="Your story, mission and values." viewHref="/about" sections={SECTIONS}>
      {(site, update) => {
        const a = site.about;
        return (
          <>
            <Section id="hero" title="Page banner">
              <PageHeroFields value={a.hero} onChange={(v) => update((d) => { d.about.hero = v; })} />
            </Section>

            <Section id="mission" title="Our mission" description="Image with your story beside it.">
              <div className="grid gap-5 md:grid-cols-[260px_1fr]">
                <MediaField label="Image" aspect="aspect-[4/5]" value={a.mission.image} onChange={(v) => update((d) => { d.about.mission.image = v; })} />
                <div className="space-y-4">
                  <TextField label="Small heading" value={a.mission.eyebrow} onChange={(v) => update((d) => { d.about.mission.eyebrow = v; })} />
                  <TextField label="Title" value={a.mission.title} onChange={(v) => update((d) => { d.about.mission.title = v; })} />
                  <TextField label="Title highlight (gold)" value={a.mission.titleAccent} onChange={(v) => update((d) => { d.about.mission.titleAccent = v; })} />
                </div>
              </div>
              <StringList multiline label="Paragraphs" items={a.mission.paragraphs} onChange={(v) => update((d) => { d.about.mission.paragraphs = v; })} placeholder="Write a new paragraph…" addLabel="Add paragraph" />
              <StringList label="Feature ticks" items={a.mission.features} onChange={(v) => update((d) => { d.about.mission.features = v; })} placeholder="e.g. Honeymoon specialists" />
            </Section>

            <Section
              id="values"
              title="Core values"
              visible={a.values.visible}
              onVisibleChange={(v) => update((d) => { d.about.values.visible = v; })}
            >
              <SectionHeadFields value={a.values} onChange={(v) => update((d) => { Object.assign(d.about.values, v); })} />
              <ObjectList
                label="Value cards"
                items={a.values.items}
                onChange={(items) => update((d) => { d.about.values.items = items; })}
                create={() => ({ icon: "Heart", title: "", desc: "" })}
                itemTitle={(v) => v.title}
                addLabel="Add value"
                renderItem={(v, set) => (
                  <>
                    <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
                      <IconPicker value={v.icon} onChange={(x) => set({ icon: x })} />
                      <TextField label="Title" value={v.title} onChange={(x) => set({ title: x })} />
                    </div>
                    <TextArea label="Description" value={v.desc} onChange={(x) => set({ desc: x })} />
                  </>
                )}
              />
            </Section>

            <Section
              id="gallery"
              title="Photo gallery"
              visible={a.gallery.visible}
              onVisibleChange={(v) => update((d) => { d.about.gallery.visible = v; })}
            >
              <SectionHeadFields value={a.gallery} onChange={(v) => update((d) => { Object.assign(d.about.gallery, v); })} />
              <p className="rounded-lg bg-sky-50 px-3.5 py-2.5 text-[13px] text-sky-800">
                Uses the same photos as the home page. <Link href="/admin/gallery" className="font-semibold underline underline-offset-2">Manage gallery photos →</Link>
              </p>
            </Section>

            <Section
              id="cta"
              title="Call-to-action banner"
              visible={a.ctaVisible}
              onVisibleChange={(v) => update((d) => { d.about.ctaVisible = v; })}
            >
              <p className="text-[13px] text-gray-500">
                Shared with other pages. <Link href="/admin/settings#cta" className="font-semibold text-gold-dark underline underline-offset-2">Edit its text in Site settings →</Link>
              </p>
            </Section>

            <Section id="seo" title="Search engine listing">
              <SeoFields path="/about" value={a.seo} onChange={(v) => update((d) => { d.about.seo = v; })} />
            </Section>
          </>
        );
      }}
    </EditorFrame>
  );
}
