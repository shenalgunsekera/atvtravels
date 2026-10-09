import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import LoginScreen from "@/components/admin/LoginScreen";
import { isAdmin } from "@/lib/admin-auth";
import { DATABASE_URL } from "@/lib/db";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) return <LoginScreen />;
  // On Vercel nothing can be saved without the database, so say so on every page.
  const storageMissing = Boolean(process.env.VERCEL) && !DATABASE_URL;
  return <AdminShell storageMissing={storageMissing}>{children}</AdminShell>;
}
