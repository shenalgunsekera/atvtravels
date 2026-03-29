import { Suspense } from "react";

export default function PackagesLayout({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>;
}
