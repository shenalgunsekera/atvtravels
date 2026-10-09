import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import LoginScreen from "@/components/admin/LoginScreen";
import { isAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) return <LoginScreen />;
  return <AdminShell>{children}</AdminShell>;
}
