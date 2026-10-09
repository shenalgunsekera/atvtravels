"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DatabaseBackup, Download, FileUp, History, RotateCcw } from "lucide-react";
import { Badge, Button, Card, EmptyState, LoadError, PageHeader, Spinner, useConfirm } from "@/components/admin/ui";
import { api, errorMessage } from "@/components/admin/api";
import { useToast } from "@/components/admin/toast";
import { formatBytes } from "@/components/admin/media";
import { timeAgo } from "@/components/admin/format";
import type { BackupInfo } from "@/lib/store";

const DOC_LABEL = { site: "Website content", packages: "Packages & destinations" } as const;

export default function BackupsPage() {
  const toast = useToast();
  const { confirm, dialog } = useConfirm();
  const [backups, setBackups] = useState<BackupInfo[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    setError(null);
    api<{ backups: BackupInfo[] }>("/api/admin/backups")
      .then((r) => setBackups(r.backups))
      .catch((e) => setError(errorMessage(e)));
  }, []);
  useEffect(load, [load]);

  async function restore(b: BackupInfo) {
    const ok = await confirm({
      title: "Restore this version?",
      message: (
        <>
          <strong>{DOC_LABEL[b.doc]}</strong> will go back to how it was on {new Date(b.createdAt).toLocaleString()}. The current version is backed up first, so you can undo this.
        </>
      ),
      confirmLabel: "Restore",
    });
    if (!ok) return;
    setBusy(b.id);
    try {
      await api("/api/admin/backups", { method: "POST", body: JSON.stringify({ restore: b.id }) });
      toast.success("Restored — the website is updated");
      load();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  async function importFile(file: File) {
    let parsed: { site?: unknown; packages?: unknown };
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      return toast.error("That file isn't a valid export.");
    }
    const ok = await confirm({
      title: "Import this file?",
      message: "All website content in the file will replace the current content. The current version is backed up first.",
      confirmLabel: "Import",
      danger: true,
    });
    if (!ok) return;
    setBusy("import");
    try {
      const payload: Record<string, unknown> = {};
      if (parsed.site) payload.site = parsed.site;
      if (parsed.packages) payload.packages = parsed.packages;
      await api("/api/admin/backups", { method: "POST", body: JSON.stringify({ import: payload }) });
      toast.success("Import complete");
      load();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Backups"
        description="A backup is made automatically every time you save. Restore any earlier version in one click."
        actions={
          <>
            <input ref={fileInput} type="file" accept="application/json,.json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) importFile(f); }} />
            <Button icon={<FileUp size={14} />} loading={busy === "import"} onClick={() => fileInput.current?.click()}>Import</Button>
            <a href="/api/admin/backups?export=1">
              <Button variant="primary" icon={<Download size={14} />}>Download everything</Button>
            </a>
          </>
        }
      />

      {error ? (
        <LoadError message={error} onRetry={load} />
      ) : backups === null ? (
        <Spinner />
      ) : backups.length === 0 ? (
        <EmptyState icon={<DatabaseBackup size={22} />} title="No backups yet" text="They'll appear here as soon as you save a change." />
      ) : (
        <Card className="divide-y divide-gray-100">
          {backups.map((b) => (
            <div key={b.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                <History size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  {timeAgo(b.createdAt)}
                  <Badge tone={b.doc === "site" ? "blue" : "gold"}>{DOC_LABEL[b.doc]}</Badge>
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(b.createdAt).toLocaleString()} · {formatBytes(b.size)}
                </p>
              </div>
              <Button size="sm" icon={<RotateCcw size={13} />} loading={busy === b.id} onClick={() => restore(b)}>
                Restore
              </Button>
            </div>
          ))}
        </Card>
      )}
      <p className="mt-4 text-center text-xs text-gray-400">The latest 40 versions of each are kept. Download everything regularly to keep a copy off the server.</p>
      {dialog}
    </>
  );
}
