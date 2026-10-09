"use client";

import { MessageCircle } from "lucide-react";
import { Section, TextField, TextArea, Field, inputBase } from "@/components/admin/ui";
import { MediaField } from "@/components/admin/media";
import { LinkField } from "@/components/admin/fields";
import EditorFrame from "@/components/admin/EditorFrame";
import SeoFields from "@/components/admin/editors/SeoFields";
import { whatsappUrl } from "@/lib/site-normalize";

const SECTIONS = [
  { id: "brand", label: "Brand" },
  { id: "contact", label: "Contact details" },
  { id: "social", label: "Social media" },
  { id: "whatsapp", label: "WhatsApp button" },
  { id: "cta", label: "CTA banner" },
  { id: "footer", label: "Header & footer" },
  { id: "seo", label: "SEO" },
];

export default function SettingsPage() {
  return (
    <EditorFrame title="Site settings" description="Details used across every page of the website." sections={SECTIONS}>
      {(site, update) => {
        const s = site.settings;
        const digits = s.whatsappNumber.replace(/\D/g, "");
        const waValid = digits.length >= 9 && digits.length <= 15;
        return (
          <>
            <Section id="brand" title="Brand" description="Business name and logo.">
              <TextField label="Business name" value={s.brandName} onChange={(v) => update((d) => { d.settings.brandName = v; })} />
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-4">
                  <TextField label="Logo text" hint="Shown when no logo image is set." value={s.logoText} onChange={(v) => update((d) => { d.settings.logoText = v; })} />
                  <TextField label="Logo small text" value={s.logoSubtext} onChange={(v) => update((d) => { d.settings.logoSubtext = v; })} />
                </div>
                <MediaField
                  label="Logo image (optional)"
                  hint="Replaces the text logo. Use a PNG/WebP with a transparent background that reads well on dark navy."
                  aspect="aspect-[3/1]"
                  value={s.logoImage}
                  onChange={(v) => update((d) => { d.settings.logoImage = v; })}
                />
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-navy px-4 py-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Preview</span>
                {s.logoImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.logoImage} alt="" className="h-10 w-auto object-contain" />
                ) : (
                  <span className="flex flex-col leading-none">
                    <span className="font-serif text-2xl font-bold tracking-wide text-white">{s.logoText}</span>
                    <span className="text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-gold">{s.logoSubtext}</span>
                  </span>
                )}
              </div>
            </Section>

            <Section id="contact" title="Contact details" description="Used in the footer, contact page and every WhatsApp button.">
              <Field
                label="WhatsApp number"
                hint={
                  waValid ? (
                    <a href={whatsappUrl(digits)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-emerald-600 hover:underline">
                      <MessageCircle size={12} /> Test this number in WhatsApp
                    </a>
                  ) : (
                    <span className="text-amber-600">Use the full international number with country code, e.g. 94714179589.</span>
                  )
                }
              >
                <input
                  value={s.whatsappNumber}
                  onChange={(e) => update((d) => { d.settings.whatsappNumber = e.target.value; })}
                  inputMode="tel"
                  placeholder="94714179589"
                  className={inputBase}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Main phone (as displayed)" value={s.phonePrimary} onChange={(v) => update((d) => { d.settings.phonePrimary = v; })} />
                <TextField label="Second phone (optional)" value={s.phoneSecondary} onChange={(v) => update((d) => { d.settings.phoneSecondary = v; })} />
                <TextField label="Email" type="email" value={s.email} onChange={(v) => update((d) => { d.settings.email = v; })} />
                <TextField label="Location" value={s.location} onChange={(v) => update((d) => { d.settings.location = v; })} />
              </div>
            </Section>

            <Section id="social" title="Social media" description="Icons only appear in the footer for links you fill in.">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Facebook" placeholder="https://facebook.com/…" value={s.socials.facebook} onChange={(v) => update((d) => { d.settings.socials.facebook = v; })} />
                <TextField label="Instagram" placeholder="https://instagram.com/…" value={s.socials.instagram} onChange={(v) => update((d) => { d.settings.socials.instagram = v; })} />
                <TextField label="YouTube" placeholder="https://youtube.com/@…" value={s.socials.youtube} onChange={(v) => update((d) => { d.settings.socials.youtube = v; })} />
                <TextField label="TikTok" placeholder="https://tiktok.com/@…" value={s.socials.tiktok} onChange={(v) => update((d) => { d.settings.socials.tiktok = v; })} />
              </div>
            </Section>

            <Section
              id="whatsapp"
              title="Floating WhatsApp button"
              description="The gold chat button in the bottom-right corner."
              visible={s.whatsappButton.visible}
              onVisibleChange={(v) => update((d) => { d.settings.whatsappButton.visible = v; })}
            >
              <TextField label="Button text" hint="Shown next to the icon on larger screens." value={s.whatsappButton.label} onChange={(v) => update((d) => { d.settings.whatsappButton.label = v; })} />
              <TextArea label="Pre-filled message" value={s.whatsappButton.message} onChange={(v) => update((d) => { d.settings.whatsappButton.message = v; })} rows={2} />
            </Section>

            <Section id="cta" title="Call-to-action banner" description="The banner at the bottom of the Home, About and Packages pages. Show or hide it per page in each page's editor.">
              <TextField label="Small heading" value={site.cta.eyebrow} onChange={(v) => update((d) => { d.cta.eyebrow = v; })} />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Title" value={site.cta.title} onChange={(v) => update((d) => { d.cta.title = v; })} />
                <TextField label="Title highlight (gold)" value={site.cta.titleAccent} onChange={(v) => update((d) => { d.cta.titleAccent = v; })} />
              </div>
              <TextArea label="Text" value={site.cta.text} onChange={(v) => update((d) => { d.cta.text = v; })} rows={2} />
              <LinkField
                label="Main button"
                value={{ label: site.cta.primaryLabel, href: site.cta.primaryHref }}
                onChange={(v) => update((d) => { d.cta.primaryLabel = v.label; d.cta.primaryHref = v.href; })}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="WhatsApp button text" hint="Leave empty to hide." value={site.cta.whatsappLabel} onChange={(v) => update((d) => { d.cta.whatsappLabel = v; })} />
                <TextArea label="WhatsApp pre-filled message" value={site.cta.whatsappMessage} onChange={(v) => update((d) => { d.cta.whatsappMessage = v; })} rows={2} />
              </div>
            </Section>

            <Section id="footer" title="Header & footer">
              <TextField label="Header button text" value={s.navCtaLabel} onChange={(v) => update((d) => { d.settings.navCtaLabel = v; })} />
              <TextArea label="Footer about text" value={s.footerAbout} onChange={(v) => update((d) => { d.settings.footerAbout = v; })} rows={3} />
              <TextField label="Footer note (bottom right)" value={s.footerNote} onChange={(v) => update((d) => { d.settings.footerNote = v; })} />
            </Section>

            <Section id="seo" title="Default search engine listing" description="Used when a page doesn't set its own, and when the site is shared on social media.">
              <TextField label="Website address" value={s.siteUrl} onChange={(v) => update((d) => { d.settings.siteUrl = v; })} hint="Used for Google and social sharing links." />
              <SeoFields value={s.seo} onChange={(v) => update((d) => { d.settings.seo = v; })} />
            </Section>
          </>
        );
      }}
    </EditorFrame>
  );
}
