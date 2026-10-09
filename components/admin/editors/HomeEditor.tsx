"use client";

import Link from "next/link";
import { Section, TextField, TextArea, NumberField, Field } from "../ui";
import { MediaField } from "../media";
import { StringList, ObjectList } from "../lists";
import { IconPicker, LinkField } from "../fields";
import EditorFrame from "../EditorFrame";
import SectionHeadFields from "./SectionHeadFields";
import SeoFields from "./SeoFields";

const SECTIONS = [
  { id: "hero", label: "Hero" },
  { id: "stats", label: "Stats" },
  { id: "about", label: "About" },
  { id: "destinations", label: "Destinations" },
  { id: "gallery", label: "Gallery" },
  { id: "why", label: "Why choose us" },
  { id: "testimonials", label: "Testimonials" },
  { id: "cta", label: "Banner" },
  { id: "seo", label: "SEO" },
];

export default function HomeEditor() {
  return (
    <EditorFrame title="Home page" description="Everything visitors see on the front page, top to bottom." viewHref="/" sections={SECTIONS}>
      {(site, update) => {
        const h = site.home;
        return (
          <>
            <Section id="hero" title="Hero" description="The full-screen opening section.">
              <TextField label="Small heading above title" value={h.hero.eyebrow} onChange={(v) => update((d) => { d.home.hero.eyebrow = v; })} />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Title" value={h.hero.title} onChange={(v) => update((d) => { d.home.hero.title = v; })} />
                <TextField label="Title highlight (gold)" value={h.hero.titleAccent} onChange={(v) => update((d) => { d.home.hero.titleAccent = v; })} />
              </div>
              <TextArea label="Subtitle" hint="Press Enter for a line break on larger screens." value={h.hero.subtitle} onChange={(v) => update((d) => { d.home.hero.subtitle = v; })} />
              <LinkField label="Main button" value={h.hero.primaryCta} onChange={(v) => update((d) => { d.home.hero.primaryCta = v; })} />
              <LinkField label="Second button" value={h.hero.secondaryCta} onChange={(v) => update((d) => { d.home.hero.secondaryCta = v; })} />
              <div className="grid gap-4 sm:grid-cols-2">
                <MediaField
                  kind="video"
                  label="Background video"
                  hint="Short, muted loop. MP4 or WebM, ideally under 20 MB."
                  value={h.hero.videoUrl}
                  onChange={(v) => update((d) => { d.home.hero.videoUrl = v; })}
                />
                <MediaField
                  label="Background image"
                  hint="Shown while the video loads, or instead of it when no video is set."
                  value={h.hero.posterImage}
                  onChange={(v) => update((d) => { d.home.hero.posterImage = v; })}
                />
              </div>
            </Section>

            <Section
              id="stats"
              title="Stats bar"
              description="The animated numbers under the hero."
              visible={h.stats.visible}
              onVisibleChange={(v) => update((d) => { d.home.stats.visible = v; })}
            >
              <ObjectList
                items={h.stats.items}
                max={4}
                onChange={(items) => update((d) => { d.home.stats.items = items; })}
                create={() => ({ value: 0, suffix: "+", label: "" })}
                itemTitle={(s) => (s.label ? `${s.value}${s.suffix} ${s.label}` : "")}
                addLabel="Add stat"
                renderItem={(s, set) => (
                  <div className="grid gap-4 sm:grid-cols-3">
                    <NumberField label="Number" value={s.value} onChange={(v) => set({ value: v })} />
                    <TextField label="After number" hint='e.g. "+" or "%"' value={s.suffix} onChange={(v) => set({ suffix: v })} />
                    <TextField label="Label" value={s.label} onChange={(v) => set({ label: v })} />
                  </div>
                )}
              />
            </Section>

            <Section
              id="about"
              title="About preview"
              description="Image and short introduction to the business."
              visible={h.about.visible}
              onVisibleChange={(v) => update((d) => { d.home.about.visible = v; })}
            >
              <div className="grid gap-5 md:grid-cols-[260px_1fr]">
                <MediaField label="Image" aspect="aspect-[4/5]" value={h.about.image} onChange={(v) => update((d) => { d.home.about.image = v; })} />
                <div className="space-y-4">
                  <TextField label="Small heading" value={h.about.eyebrow} onChange={(v) => update((d) => { d.home.about.eyebrow = v; })} />
                  <TextField label="Title" value={h.about.title} onChange={(v) => update((d) => { d.home.about.title = v; })} />
                </div>
              </div>
              <StringList multiline label="Paragraphs" items={h.about.paragraphs} onChange={(v) => update((d) => { d.home.about.paragraphs = v; })} placeholder="Write a new paragraph…" addLabel="Add paragraph" />
              <StringList label="Feature ticks" items={h.about.features} onChange={(v) => update((d) => { d.home.about.features = v; })} placeholder="e.g. 24/7 Support" />
              <LinkField
                label="Button"
                value={{ label: h.about.buttonLabel, href: h.about.buttonHref }}
                onChange={(v) => update((d) => { d.home.about.buttonLabel = v.label; d.home.about.buttonHref = v.href; })}
              />
            </Section>

            <Section
              id="destinations"
              title="Destinations"
              description="Tiles linking to each destination."
              visible={h.destinations.visible}
              onVisibleChange={(v) => update((d) => { d.home.destinations.visible = v; })}
            >
              <SectionHeadFields value={h.destinations} onChange={(v) => update((d) => { Object.assign(d.home.destinations, v); })} />
              <p className="rounded-lg bg-sky-50 px-3.5 py-2.5 text-[13px] text-sky-800">
                The tiles come from your destinations. <Link href="/admin/destinations" className="font-semibold underline underline-offset-2">Manage destinations →</Link>
              </p>
            </Section>

            <Section
              id="gallery"
              title="Photo gallery"
              description="Two scrolling rows of traveller photos."
              visible={h.gallery.visible}
              onVisibleChange={(v) => update((d) => { d.home.gallery.visible = v; })}
            >
              <SectionHeadFields value={h.gallery} onChange={(v) => update((d) => { Object.assign(d.home.gallery, v); })} />
              <p className="rounded-lg bg-sky-50 px-3.5 py-2.5 text-[13px] text-sky-800">
                {site.gallery.photos.length} photos. <Link href="/admin/gallery" className="font-semibold underline underline-offset-2">Manage gallery photos →</Link>
              </p>
            </Section>

            <Section
              id="why"
              title="Why choose us"
              description="Feature cards on the dark background."
              visible={h.why.visible}
              onVisibleChange={(v) => update((d) => { d.home.why.visible = v; })}
            >
              <SectionHeadFields value={h.why} onChange={(v) => update((d) => { Object.assign(d.home.why, v); })} />
              <ObjectList
                label="Cards"
                items={h.why.items}
                onChange={(items) => update((d) => { d.home.why.items = items; })}
                create={() => ({ icon: "Star", title: "", desc: "" })}
                itemTitle={(r) => r.title}
                addLabel="Add card"
                renderItem={(r, set) => (
                  <>
                    <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
                      <IconPicker value={r.icon} onChange={(v) => set({ icon: v })} />
                      <TextField label="Title" value={r.title} onChange={(v) => set({ title: v })} />
                    </div>
                    <TextArea label="Description" value={r.desc} onChange={(v) => set({ desc: v })} />
                  </>
                )}
              />
            </Section>

            <Section
              id="testimonials"
              title="Testimonials"
              description="Reviews from past travellers."
              visible={h.testimonials.visible}
              onVisibleChange={(v) => update((d) => { d.home.testimonials.visible = v; })}
            >
              <SectionHeadFields value={h.testimonials} onChange={(v) => update((d) => { Object.assign(d.home.testimonials, v); })} />
              <ObjectList
                label="Reviews"
                items={h.testimonials.items}
                onChange={(items) => update((d) => { d.home.testimonials.items = items; })}
                create={() => ({ name: "", trip: "", stars: 5, text: "" })}
                itemTitle={(t) => (t.name ? `${t.name}${t.trip ? ` — ${t.trip}` : ""}` : "")}
                addLabel="Add review"
                renderItem={(t, set) => (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <TextField label="Name" value={t.name} onChange={(v) => set({ name: v })} />
                      <TextField label="Trip" placeholder="e.g. Maldives Honeymoon" value={t.trip} onChange={(v) => set({ trip: v })} />
                    </div>
                    <Field label="Rating">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => set({ stars: n })}
                            className={`text-2xl leading-none transition-colors ${n <= t.stars ? "text-gold" : "text-gray-200 hover:text-gold/50"}`}
                            aria-label={`${n} star${n > 1 ? "s" : ""}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </Field>
                    <TextArea label="Review" value={t.text} onChange={(v) => set({ text: v })} rows={4} />
                  </>
                )}
              />
            </Section>

            <Section
              id="cta"
              title="Call-to-action banner"
              description="The 'Your Dream Holiday Awaits' banner at the bottom."
              visible={h.ctaVisible}
              onVisibleChange={(v) => update((d) => { d.home.ctaVisible = v; })}
            >
              <p className="text-[13px] text-gray-500">
                This banner is shared by several pages. <Link href="/admin/settings#cta" className="font-semibold text-gold-dark underline underline-offset-2">Edit its text in Site settings →</Link>
              </p>
            </Section>

            <Section id="seo" title="Search engine listing" description="How the home page appears on Google.">
              <SeoFields value={h.seo} onChange={(v) => update((d) => { d.home.seo = v; })} />
            </Section>
          </>
        );
      }}
    </EditorFrame>
  );
}
