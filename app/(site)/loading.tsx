export default function Loading() {
  return (
    <div className="fixed inset-0 z-[999] bg-gradient-to-b from-white to-[#f8f6f0] flex items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        <div className="relative w-16 h-16 loader-pulse">
          <div className="absolute inset-0 rounded-full border border-gold/25" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold border-r-gold/50 animate-spin" />
          <div className="absolute inset-[14px] rounded-full bg-navy/95" />
          <div className="absolute inset-[24px] rounded-full bg-gold/90" />
        </div>
        <p className="text-[0.7rem] tracking-[0.24em] uppercase text-navy/75 font-semibold">
          ATV Travels
        </p>
        <div className="relative w-44 h-[3px] rounded-full bg-gold/20 overflow-hidden">
          <span className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-gold to-transparent loader-sweep" />
        </div>
      </div>
    </div>
  );
}
