"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin, MessageCircle, CheckCircle } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SectionHeader from "@/components/ui/SectionHeader";

const WA_NUMBER = "94714179589";

const faqs = [
  {
    q: "Do your packages include visa assistance?",
    a: "Yes! We provide full guidance on visa requirements for all our destinations and can assist with the application process.",
  },
  {
    q: "Can I customise a package?",
    a: "Absolutely. Every package can be tailored to your preferences — different hotels, extended stays, add-on activities, and more.",
  },
  {
    q: "How do I confirm my booking?",
    a: "Simply enquire via WhatsApp or our contact form. Our team will prepare a personalised quote and walk you through the booking process.",
  },
  {
    q: "Are prices fixed or negotiable?",
    a: "Prices vary based on travel dates and availability. Contact us and we'll find the best deal for your specific dates.",
  },
  {
    q: "Do you offer group tour discounts?",
    a: "Yes, we offer special rates for groups of 6 or more. Contact us for a customised group quote.",
  },
];

export default function ContactPage() {
  const [open, setOpen] = useState<number | null>(null);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", destination: "", message: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const lines = [
      "🌏 *New Tour Enquiry — ATV Travels*",
      "─────────────────────────",
      `👤 *Name:* ${form.name}`,
      form.email    ? `📧 *Email:* ${form.email}`          : null,
      form.phone    ? `📞 *Phone:* ${form.phone}`          : null,
      form.destination ? `📍 *Destination:* ${form.destination}` : null,
      "─────────────────────────",
      `💬 *Message:*\n${form.message}`,
      "─────────────────────────",
      "_Sent via ATV Travels website_",
    ].filter(Boolean).join("\n");

    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setSent(true);
    setForm({ name: "", email: "", phone: "", destination: "", message: "" });
  }

  const waMsg = encodeURIComponent("Hi ATV Travels! I'd like to enquire about a tour package.");

  return (
    <>
      {/* Hero */}
      <section className="relative h-[52vh] min-h-[380px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1600&q=80&auto=format&fit=crop"
            alt="Contact ATV Travels"
            fill priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/55 to-navy/78" />
        </div>
        <div className="relative z-10 text-center px-5">
          <span className="text-xs font-semibold tracking-[0.22em] uppercase text-gold block mb-3">We&apos;re Here to Help</span>
          <h1 className="font-serif text-white mb-3">Get In Touch</h1>
          <p className="text-white/75 text-base max-w-md mx-auto">
            Have a question or ready to start planning? Our team is just a message away.
          </p>
          <nav className="flex items-center gap-2 justify-center mt-5 text-xs text-white/50">
            <Link href="/" className="hover:text-gold transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gold">Contact</span>
          </nav>
        </div>
      </section>

      {/* Contact grid */}
      <section className="section-padding">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">

            {/* Info card */}
            <div className="lg:col-span-2">
              <ScrollReveal direction="left">
                <div className="bg-navy rounded-2xl p-8 sm:p-10 text-white h-full">
                  <h3 className="font-serif text-white text-xl mb-2">Contact Information</h3>
                  <p className="text-white/55 text-sm mb-8 leading-relaxed">
                    Reach us by phone, WhatsApp, or email. We respond quickly — usually within the hour.
                  </p>

                  {[
                    { icon: Phone, label: "Main WhatsApp", value: "+94 71 417 9589", href: `https://wa.me/94714179589` },
                    { icon: Phone, label: "Secondary Contact", value: "+94 70 717 9589", href: `tel:+94707179589` },
                    { icon: Mail,  label: "Email", value: "info@atvtravels.com", href: "mailto:info@atvtravels.com" },
                    { icon: MapPin, label: "Location", value: "Colombo, Sri Lanka", href: null },
                  ].map((item) => (
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

                  <a
                    href={`https://wa.me/${WA_NUMBER}?text=${waMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2.5 bg-gold hover:bg-gold-light text-white font-semibold py-3.5 px-6 rounded-full transition-all duration-300 hover:-translate-y-0.5 shadow-[0_6px_20px_rgba(201,168,76,0.3)] hover:shadow-[0_8px_24px_rgba(201,168,76,0.35)] w-full mt-4"
                  >
                    <MessageCircle size={17} />
                    Chat on WhatsApp
                  </a>
                </div>
              </ScrollReveal>
            </div>

            {/* Enquiry form */}
            <div className="lg:col-span-3">
              <ScrollReveal direction="right" delay={0.08}>
                <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-md border border-gray-100">
                  <h3 className="font-serif text-navy text-xl mb-1.5">Send an Enquiry</h3>
                  <p className="text-gray-500 text-sm mb-7">
                    Fill in the form and we&apos;ll get back to you with a personalised quote.
                  </p>

                  {sent ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                      <CheckCircle size={52} className="text-teal" />
                      <h4 className="font-serif text-navy text-xl">Opening WhatsApp!</h4>
                      <p className="text-gray-500 text-sm max-w-sm">
                        Your enquiry has been formatted and sent to our WhatsApp. We&apos;ll reply as soon as possible!
                      </p>
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
                            className="w-full px-4 py-3 border-[1.5px] border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-gold focus:ring-2 focus:ring-gold/15 transition-colors placeholder:text-gray-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-navy mb-1.5 tracking-wide">Email *</label>
                          <input
                            required type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="your@email.com"
                            className="w-full px-4 py-3 border-[1.5px] border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-gold focus:ring-2 focus:ring-gold/15 transition-colors placeholder:text-gray-400"
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
                            className="w-full px-4 py-3 border-[1.5px] border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-gold focus:ring-2 focus:ring-gold/15 transition-colors placeholder:text-gray-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-navy mb-1.5 tracking-wide">Destination</label>
                          <select
                            value={form.destination}
                            onChange={(e) => setForm({ ...form, destination: e.target.value })}
                            className="w-full px-4 py-3 border-[1.5px] border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-gold focus:ring-2 focus:ring-gold/15 transition-colors appearance-none bg-white"
                          >
                            <option value="">Select destination</option>
                            <option>Thailand</option>
                            <option>Malaysia</option>
                            <option>Maldives</option>
                            <option>Bali</option>
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
                          className="w-full px-4 py-3 border-[1.5px] border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-gold focus:ring-2 focus:ring-gold/15 transition-colors resize-none placeholder:text-gray-400"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-white font-semibold py-4 rounded-full transition-all duration-300 hover:-translate-y-0.5 shadow-[0_6px_20px_rgba(201,168,76,0.3)] hover:shadow-[0_8px_24px_rgba(201,168,76,0.35)]"
                      >
                        <MessageCircle size={17} />
                        Send via WhatsApp
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
      <section className="section-padding bg-[#F8F6F0]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12">
          <SectionHeader
            label="FAQs"
            title="Common Questions"
            description="Quick answers to the things our travellers ask most."
          />
          <div className="max-w-2xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 0.05}>
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
                      open === i ? "max-h-48 py-4 px-5" : "max-h-0"
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
    </>
  );
}
