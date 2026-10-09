"use client";

import Link from "next/link";
import { Section, TextField, TextArea } from "../ui";
import { ObjectList } from "../lists";
import EditorFrame from "../EditorFrame";
import PageHeroFields from "./PageHeroFields";
import SectionHeadFields from "./SectionHeadFields";
import SeoFields from "./SeoFields";

const SECTIONS = [
  { id: "hero", label: "Banner" },
  { id: "info", label: "Contact card" },
  { id: "form", label: "Enquiry form" },
  { id: "faq", label: "FAQs" },
  { id: "seo", label: "SEO" },
];

export default function ContactEditor() {
  return (
    <EditorFrame title="Contact page" description="Contact details, the enquiry form and FAQs." viewHref="/contact" sections={SECTIONS}>
      {(site, update) => {
        const c = site.contact;
        return (
          <>
            <Section id="hero" title="Page banner">
              <PageHeroFields value={c.hero} onChange={(v) => update((d) => { d.contact.hero = v; })} />
            </Section>

            <Section id="info" title="Contact information card" description="The dark card listing your phone numbers, email and location.">
              <TextField label="Title" value={c.info.title} onChange={(v) => update((d) => { d.contact.info.title = v; })} />
              <TextArea label="Text" value={c.info.text} onChange={(v) => update((d) => { d.contact.info.text = v; })} rows={2} />
              <p className="rounded-lg bg-sky-50 px-3.5 py-2.5 text-[13px] text-sky-800">
                Phone numbers, email and location are set once for the whole site.{" "}
                <Link href="/admin/settings#contact" className="font-semibold underline underline-offset-2">Edit contact details →</Link>
              </p>
            </Section>

            <Section id="form" title="Enquiry form" description="Submissions open WhatsApp with the message pre-filled.">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Title" value={c.form.title} onChange={(v) => update((d) => { d.contact.form.title = v; })} />
                <TextField label="Button text" value={c.form.buttonLabel} onChange={(v) => update((d) => { d.contact.form.buttonLabel = v; })} />
              </div>
              <TextArea label="Text" value={c.form.text} onChange={(v) => update((d) => { d.contact.form.text = v; })} rows={2} />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Success title" value={c.form.successTitle} onChange={(v) => update((d) => { d.contact.form.successTitle = v; })} />
                <TextArea label="Success message" value={c.form.successText} onChange={(v) => update((d) => { d.contact.form.successText = v; })} rows={2} />
              </div>
            </Section>

            <Section
              id="faq"
              title="Frequently asked questions"
              visible={c.faq.visible}
              onVisibleChange={(v) => update((d) => { d.contact.faq.visible = v; })}
            >
              <SectionHeadFields value={c.faq} onChange={(v) => update((d) => { Object.assign(d.contact.faq, v); })} />
              <ObjectList
                label="Questions"
                items={c.faq.items}
                onChange={(items) => update((d) => { d.contact.faq.items = items; })}
                create={() => ({ q: "", a: "" })}
                itemTitle={(f) => f.q}
                addLabel="Add question"
                renderItem={(f, set) => (
                  <>
                    <TextField label="Question" value={f.q} onChange={(v) => set({ q: v })} />
                    <TextArea label="Answer" value={f.a} onChange={(v) => set({ a: v })} rows={3} />
                  </>
                )}
              />
            </Section>

            <Section id="seo" title="Search engine listing">
              <SeoFields path="/contact" value={c.seo} onChange={(v) => update((d) => { d.contact.seo = v; })} />
            </Section>
          </>
        );
      }}
    </EditorFrame>
  );
}
