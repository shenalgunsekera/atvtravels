"use client";

import { useEffect, useState } from "react";
import BrandLoader from "@/components/ui/BrandLoader";

// A template re-mounts on every page change, so this plays the ATV loading screen briefly on
// each navigation. Pages are cached and appear instantly now, which meant the loading.tsx
// screen never got a chance to show. The fade-out is pure CSS (it runs even before the page's
// JavaScript loads), the page renders underneath straight away, and visitors who prefer
// reduced motion don't see it.
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 900); // remove after the CSS fade finishes
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {children}
      {visible && <BrandLoader className="page-transition pointer-events-none motion-reduce:hidden" />}
    </>
  );
}
