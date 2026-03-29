"use client";

import { useState, useEffect } from "react";
import { Save, Eye, EyeOff, Edit3, X, Check } from "lucide-react";

type PackageData = {
  id: string;
  name: string;
  duration: string;
  image: string;
  highlights: string[];
  inclusions: string[];
  description: string;
};

type CountryData = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  packages: PackageData[];
};

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [data, setData] = useState<Record<string, CountryData> | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<PackageData>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function fetchData(key: string) {
    const res = await fetch("/api/admin/packages", {
      headers: { "x-admin-secret": key },
    });
    if (res.ok) {
      setData(await res.json());
      setAuthed(true);
    } else {
      alert("Invalid password");
    }
  }

  async function saveEdit(countryId: string, pkgId: string) {
    setSaving(true);
    const res = await fetch("/api/admin/packages", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": secret,
      },
      body: JSON.stringify({ countryId, packageId: pkgId, updates: editDraft }),
    });
    setSaving(false);
    if (res.ok) {
      await fetchData(secret);
      setEditingId(null);
      setEditDraft({});
      showToast("Saved successfully!");
    } else {
      showToast("Failed to save. Try again.");
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function startEdit(pkg: PackageData) {
    setEditingId(pkg.id);
    setEditDraft({
      name: pkg.name,
      duration: pkg.duration,
      description: pkg.description,
      highlights: pkg.highlights,
      inclusions: pkg.inclusions,
      image: pkg.image,
    });
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm">
          <div className="flex flex-col leading-none mb-6">
            <span className="font-serif text-2xl font-bold text-navy tracking-wide">ATV</span>
            <span className="text-[0.55rem] tracking-[0.3em] text-gold font-semibold uppercase">Admin Panel</span>
          </div>
          <p className="text-gray-500 text-sm mb-6">Enter your admin password to manage packages.</p>
          <div className="relative mb-4">
            <input
              type={showSecret ? "text" : "password"}
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchData(secret)}
              placeholder="Admin password"
              className="w-full px-4 py-3 border-[1.5px] border-gray-200 rounded-lg text-sm outline-none focus:border-gold pr-10"
            />
            <button
              onClick={() => setShowSecret((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy"
            >
              {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button
            onClick={() => fetchData(secret)}
            className="w-full bg-navy hover:bg-navy-light text-white font-semibold py-3 rounded-full text-sm transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-navy text-2xl">Package Manager</h1>
            <p className="text-gray-500 text-sm mt-1">Edit package details below. Changes save immediately.</p>
          </div>
          <button
            onClick={() => setAuthed(false)}
            className="text-xs text-gray-400 hover:text-navy transition-colors"
          >
            Sign out
          </button>
        </div>

        {/* Countries */}
        {data && Object.values(data).map((country) => (
          <div key={country.id} className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-6 rounded-full bg-gold" />
              <h2 className="font-serif text-navy text-xl">{country.name}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {country.packages.map((pkg) => (
                <div key={pkg.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  {editingId === pkg.id ? (
                    <div className="space-y-3">
                      <input
                        value={editDraft.name ?? ""}
                        onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold outline-none focus:border-gold"
                        placeholder="Package name"
                      />
                      <input
                        value={editDraft.duration ?? ""}
                        onChange={(e) => setEditDraft({ ...editDraft, duration: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-gold"
                        placeholder="Duration (e.g. 5 Days / 4 Nights)"
                      />
                      <textarea
                        value={editDraft.description ?? ""}
                        onChange={(e) => setEditDraft({ ...editDraft, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-gold resize-none"
                        rows={3}
                        placeholder="Description"
                      />
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Highlights (comma-separated)</label>
                        <input
                          value={(editDraft.highlights ?? []).join(", ")}
                          onChange={(e) => setEditDraft({ ...editDraft, highlights: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-gold"
                          placeholder="Place 1, Place 2, ..."
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Inclusions (comma-separated)</label>
                        <input
                          value={(editDraft.inclusions ?? []).join(", ")}
                          onChange={(e) => setEditDraft({ ...editDraft, inclusions: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-gold"
                          placeholder="Flights, Hotel, ..."
                        />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => saveEdit(country.id, pkg.id)}
                          disabled={saving}
                          className="flex items-center gap-1.5 bg-gold text-navy font-semibold text-xs px-4 py-2 rounded-full transition-colors hover:bg-gold-light disabled:opacity-60"
                        >
                          <Save size={12} />
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={() => { setEditingId(null); setEditDraft({}); }}
                          className="flex items-center gap-1.5 bg-gray-100 text-gray-600 font-semibold text-xs px-4 py-2 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          <X size={12} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h3 className="font-serif text-navy text-base">{pkg.name}</h3>
                          <span className="text-xs text-gray-400">{pkg.duration}</span>
                        </div>
                        <button
                          onClick={() => startEdit(pkg)}
                          className="flex items-center gap-1 text-xs text-gold hover:text-gold-dark font-medium flex-shrink-0 mt-0.5"
                        >
                          <Edit3 size={12} /> Edit
                        </button>
                      </div>
                      <p className="text-gray-500 text-xs leading-relaxed mb-3">{pkg.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {pkg.highlights.map((h) => (
                          <span key={h} className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">{h}</span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-navy text-white text-sm px-5 py-3 rounded-full shadow-lg flex items-center gap-2">
          <Check size={14} className="text-teal" />
          {toast}
        </div>
      )}
    </div>
  );
}
