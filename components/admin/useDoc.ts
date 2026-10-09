"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, errorMessage } from "./api";
import { useToast } from "./toast";
import type { PackagesData, SiteContent } from "@/lib/site-types";

type Docs = { site: SiteContent; packages: PackagesData };

/**
 * Loads one content document and tracks local edits against the saved copy.
 * - `update(draft => { ... })` mutates a fresh clone, so callers can write plain assignments.
 * - `save()` persists the draft; `commit(next)` saves a given value immediately (for list actions).
 * - Ctrl/Cmd+S saves, and leaving the page with unsaved changes asks first.
 */
export function useDoc<K extends keyof Docs>(name: K) {
  const toast = useToast();
  const [saved, setSaved] = useState<Docs[K] | null>(null);
  const [draft, setDraft] = useState<Docs[K] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const version = useRef<string>("");

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await api<{ data: Docs[K]; version: string }>(`/api/admin/content/${name}`);
      version.current = res.version;
      setSaved(res.data);
      setDraft(res.data);
    } catch (err) {
      setLoadError(errorMessage(err));
    }
  }, [name]);

  useEffect(() => {
    load();
  }, [load]);

  const dirty = saved !== null && draft !== null && JSON.stringify(saved) !== JSON.stringify(draft);

  const update = useCallback((fn: (d: Docs[K]) => void) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
  }, []);

  const commit = useCallback(
    async (next: Docs[K], successMessage = "Changes saved", undo?: Docs[K]): Promise<boolean> => {
      setSaving(true);
      try {
        const res = await api<{ data: Docs[K]; version: string }>(`/api/admin/content/${name}`, {
          method: "PUT",
          body: JSON.stringify({ data: next, version: version.current }),
        });
        version.current = res.version;
        setSaved(res.data);
        setDraft(res.data);
        toast.success(
          successMessage,
          undo ? { label: "Undo", run: () => void commitRef.current?.(undo, "Change undone") } : undefined
        );
        return true;
      } catch (err) {
        toast.error(errorMessage(err));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [name, toast]
  );
  const commitRef = useRef(commit);
  commitRef.current = commit;

  const save = useCallback(async () => {
    if (!draft || !dirty) return true;
    return commit(draft);
  }, [draft, dirty, commit]);

  const discard = useCallback(() => setDraft(saved), [saved]);

  useUnsavedGuard(dirty, save);

  return { data: draft, saved, loading: draft === null && !loadError, loadError, reload: load, dirty, saving, update, save, commit, discard };
}

// Ctrl/Cmd+S to save, plus a warning before leaving the page with unsaved changes.
export function useUnsavedGuard(dirty: boolean, save: () => unknown) {
  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void saveRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Warn before closing the tab with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  // Warn before in-app navigation (sidebar links) with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      if (!a || a.target === "_blank" || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (!window.confirm("You have unsaved changes. Leave without saving?")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [dirty]);
}
