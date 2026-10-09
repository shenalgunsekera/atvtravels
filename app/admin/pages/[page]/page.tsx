import { notFound } from "next/navigation";
import HomeEditor from "@/components/admin/editors/HomeEditor";
import AboutEditor from "@/components/admin/editors/AboutEditor";
import ContactEditor from "@/components/admin/editors/ContactEditor";
import PackagesPageEditor from "@/components/admin/editors/PackagesPageEditor";

const EDITORS = {
  home: HomeEditor,
  about: AboutEditor,
  contact: ContactEditor,
  packages: PackagesPageEditor,
};

export default async function PageEditor({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  const Editor = EDITORS[page as keyof typeof EDITORS];
  if (!Editor) notFound();
  return <Editor />;
}
