export default function Loading() {
  return (
    <div className="fixed inset-0 z-[999] bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-gold/25" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold animate-spin" />
        </div>
        <p className="text-[0.7rem] tracking-[0.22em] uppercase text-navy/70 font-semibold">
          ATV Travels
        </p>
      </div>
    </div>
  );
}
