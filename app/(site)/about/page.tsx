import type { Metadata } from "next";
import { Check } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SiteImage from "@/components/ui/SiteImage";
import PageHero from "@/components/ui/PageHero";
import CtaBanner from "@/components/home/CtaBanner";
import PhotoMarquee from "@/components/home/PhotoMarquee";
import { getIcon } from "@/lib/icons";
import { getSite } from "@/lib/packages";

export async function generateMetadata(): Promise<Metadata> {
  const { about } = await getSite();
  return {
    title: about.seo.title,
    description: about.seo.description,
    alternates: { canonical: "/about" },
  };
}

export default async function AboutPage() {
  const site = await getSite();
  const { about } = site;
  const { mission, values } = about;

  return (
    <>
      <PageHero hero={about.hero} crumb="About Us" />

      {/* Mission Section */}
      <section className="section-padding">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <ScrollReveal direction="left">
              <div className="relative rounded-2xl overflow-hidden h-[420px] sm:h-[500px]">
                <SiteImage
                  src={mission.image}
                  alt="ATV Travels team planning holidays"
                  fill
                  sizes="(min-width: 1024px) 600px, 100vw"
                  className="object-cover"
                />
              </div>
            </ScrollReveal>

            <div>
              <ScrollReveal direction="right" delay={0.05}>
                <span className="text-xs font-semibold tracking-[0.22em] uppercase text-gold block mb-3">{mission.eyebrow}</span>
              </ScrollReveal>
              <ScrollReveal direction="right" delay={0.1}>
                <h2 className="font-serif text-navy mb-5">
                  {mission.title} {mission.titleAccent && <em className="text-gold">{mission.titleAccent}</em>}
                </h2>
              </ScrollReveal>
              <ScrollReveal direction="right" delay={0.14}>
                {mission.paragraphs.map((p, i) => (
                  <p key={i} className={`text-gray-500 leading-relaxed ${i === mission.paragraphs.length - 1 ? "mb-7" : "mb-4"}`}>
                    {p}
                  </p>
                ))}
              </ScrollReveal>
              <ScrollReveal direction="up" delay={0.2}>
                <div className="grid grid-cols-2 gap-3">
                  {mission.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check size={13} className="text-teal flex-shrink-0" />
                      <span className="text-sm text-gray-600">{f}</span>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      {values.visible && values.items.length > 0 && (
        <section className="section-padding bg-[#F8F6F0]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12">
            <SectionHeader label={values.label} title={values.title} description={values.description} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.items.map((v, i) => {
                const Icon = getIcon(v.icon);
                return (
                  <ScrollReveal key={i} direction="up" delay={(i % 4) * 0.08}>
                    <div className="h-full bg-white rounded-2xl p-7 text-center shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1.5 hover:border-gold/30 transition-all duration-350 group">
                      <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4 text-gold group-hover:bg-gold group-hover:text-navy transition-all duration-300">
                        <Icon size={22} />
                      </div>
                      <h3 className="font-serif text-navy text-base mb-2.5">{v.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {about.gallery.visible && <PhotoMarquee head={about.gallery} photos={site.gallery.photos} background="#ffffff" />}

      {about.ctaVisible && <CtaBanner cta={site.cta} whatsappNumber={site.settings.whatsappNumber} />}
    </>
  );
}
