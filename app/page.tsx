import Hero from "@/components/home/Hero";
import StatsBar from "@/components/home/StatsBar";
import AboutPreview from "@/components/home/AboutPreview";
import DestinationsSection from "@/components/home/DestinationsSection";
import ExperienceSlider from "@/components/home/ExperienceSlider";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Testimonials from "@/components/home/Testimonials";
import CtaBanner from "@/components/home/CtaBanner";

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <AboutPreview />
      <DestinationsSection />
      <ExperienceSlider />
      <WhyChooseUs />
      <Testimonials />
      <CtaBanner />
    </>
  );
}
