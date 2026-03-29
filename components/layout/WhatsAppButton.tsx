"use client";

import { MessageCircle } from "lucide-react";

const WA_NUMBER = "94714179589";
const WA_MESSAGE = encodeURIComponent(
  "Hi ATV Travels! I'd like to enquire about a tour package."
);
const WA_URL = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`;

export default function WhatsAppButton() {
  return (
    <a
      href={WA_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="
        fixed bottom-8 right-8 z-40
        flex items-center gap-2.5
        bg-gold text-white
        font-semibold text-sm
        px-4 py-3.5 sm:px-5
        rounded-full
        shadow-[0_6px_24px_rgba(201,168,76,0.45)]
        hover:bg-gold-light hover:-translate-y-1 hover:scale-105
        transition-all duration-300
        animate-wa-pulse
      "
    >
      <MessageCircle size={22} strokeWidth={2.2} />
      <span className="hidden sm:inline">Chat with Us</span>
    </a>
  );
}
