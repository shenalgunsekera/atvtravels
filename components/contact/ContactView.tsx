"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, MessageCircle, CheckCircle } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SectionHeader from "@/components/ui/SectionHeader";
import { whatsappUrl } from "@/lib/site-normalize";
import type { SiteContent, SiteSettings } from "@/lib/site-types";

interface Props {
  contact: SiteContent["contact"];
  settings: SiteSettings;
  destinations: string[];
}

const inputClass =
  "w-full px-4 py-3 border-[1.5px] border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-gold focus:ring-2 focus:ring-gold/15 transition-colors placeholder:text-gray-400";

export default function ContactView({ contact, settings, destinations }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", destination: "", message: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const lines = [
      `🌏 *New Tour Enquiry — ${settings.brandName}*`,
      "─────────────────────────",
      `👤 *Name:* ${form.name}`,
      form.email    ? `📧 *Email:* ${form.email}`          : null,
      form.phone    ? `📞 *Phone:* ${form.phone}`          : null,
      form.destination ? `📍 *Destination:* ${form.destination}` : null,
      "─────────────────────────",
      `💬 *Message:*\n${form.message}`,
      "─────────────────────────",
      `_Sent via ${settings.brandName} website_`,
    ].filter(Boolean).join("\n");

    window.open(whatsappUrl(settings.whatsappNumber, lines), "_blank", "noopener,noreferrer");
    setSent(true);
    setForm({ name: "", email: "", phone: "", destination: "", message: "" });
  }

  const phoneDigits = (p: string) => p.replace(/[^\d+]/g, "");
  const infoItems = [
    settings.phonePrimary && { icon: Phone, label: "Main WhatsApp", value: settings.phonePrimary, href: whatsappUrl(settings.whatsappNumber) },
    settings.phoneSecondary && { icon: Phone, label: "Secondary Contact", value: settings.phoneSecondary, href: `tel:${phoneDigits(settings.phoneSecondary)}` },
    settings.email && { icon: Mail, label: "Email", value: settings.email, href: `mailto:${settings.email}` },
    settings.location && { icon: MapPin, label: "Location", value: settings.location, href: null },
  ].filter((x): x is { icon: typeof Phone; label: string; value: string; href: string | null } => Boolean(x));

  return (
    <>
      {/* Contact grid */}
      <section className="section-padding">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">

            {/* Info card */}
            <div className="lg:col-span-2">
              <ScrollReveal direction="left">
                <div className="bg-navy rounded-2xl p-8 sm:p-10 text-white h-full">
                  <h3 className="font-serif text-white text-xl mb-2">{contact.info.title}</h3>
                  <p className="text-white/55 text-sm mb-8 leading-relaxed">{contact.info.text}</p>

                  {infoItems.map((item) => (
                    <div key={item.label} className="flex items-start gap-4 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-gold/15 flex items-center justify-center text-gold flex-shrink-0">
                        <item.icon size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-white/45 mb-0.5">{item.label}</p>
                        {item.href ? (
                          <a href={item.href} className="text-white text-sm font-medium hover:text-gold transition-colors">
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-white text-sm font-medium">{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>

            {/* Enquiry form */}
            <div className="lg:col-span-3">
              <ScrollReveal direction="right" delay={0.08}>
                <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-md border border-gray-100">
                  <h3 className="font-serif text-navy text-xl mb-1.5">{contact.form.title}</h3>
                  <p className="text-gray-500 text-sm mb-7">{contact.form.text}</p>

                  {sent ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                      <CheckCircle size={52} className="text-teal" />
                      <h4 className="font-serif text-navy text-xl">{contact.form.successTitle}</h4>
                      <p className="text-gray-500 text-sm max-w-sm">{contact.form.successText}</p>
                      <button
                        onClick={() => setSent(false)}
                        className="mt-2 text-sm text-gold hover:text-gold-dark underline underline-offset-2 transition-colors"
                      >
                        Send another enquiry
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-navy mb-1.5 tracking-wide">Full Name *</label>
                          <input
                            required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="Your name"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-navy mb-1.5 tracking-wide">Email *</label>
                          <input
                            required type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="your@email.com"
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-navy mb-1.5 tracking-wide">Phone / WhatsApp</label>
                          <input
                            type="tel"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            placeholder="+94 77 ..."
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-navy mb-1.5 tracking-wide">Destination</label>
                          <select
                            value={form.destination}
                            onChange={(e) => setForm({ ...form, destination: e.target.value })}
                            className={`${inputClass} appearance-none bg-white`}
                          >
                            <option value="">Select destination</option>
                            {destinations.map((d) => (
                              <option key={d}>{d}</option>
                            ))}
                            <option>Not decided yet</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-navy mb-1.5 tracking-wide">Message *</label>
                        <textarea
                          required
                          rows={4}
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          placeholder="Tell us about your travel plans, number of travellers, preferred dates..."
                          className={`${inputClass} resize-none`}
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-white font-semibold py-4 rounded-full transition-all duration-300 hover:-translate-y-0.5 shadow-[0_6px_20px_rgba(201,168,76,0.3)] hover:shadow-[0_8px_24px_rgba(201,168,76,0.35)]"
                      >
                        <MessageCircle size={17} />
                        {contact.form.buttonLabel}
                      </button>
                    </form>
                  )}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      {contact.faq.visible && contact.faq.items.length > 0 && (
        <section className="section-padding bg-[#F8F6F0]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12">
            <SectionHeader label={contact.faq.label} title={contact.faq.title} description={contact.faq.description} />
            <div className="max-w-2xl mx-auto space-y-3">
              {contact.faq.items.map((faq, i) => (
                <ScrollReveal key={i} direction="up" delay={Math.min(i, 8) * 0.05}>
                  <div
                    className={`border rounded-xl overflow-hidden transition-colors duration-300 ${
                      open === i ? "border-gold" : "border-gray-200"
                    }`}
                  >
                    <button
                      onClick={() => setOpen(open === i ? null : i)}
                      className="w-full flex items-center justify-between gap-4 p-5 text-left font-semibold text-navy text-sm hover:text-gold/80 transition-colors bg-white"
                    >
                      {faq.q}
                      <span
                        className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs transition-all duration-300 ${
                          open === i ? "bg-gold text-navy rotate-180" : "bg-gray-100 text-navy"
                        }`}
                      >
                        ↓
                      </span>
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-400 ${
                        open === i ? "max-h-96 py-4 px-5" : "max-h-0"
                      } bg-white text-gray-500 text-sm leading-relaxed`}
                    >
                      {faq.a}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
