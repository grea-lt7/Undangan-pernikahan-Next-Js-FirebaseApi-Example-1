"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Plus, Save, Trash2 } from "lucide-react";
import { AnimatedGradient } from "@/components/motion/AnimatedGradient";
import { FloatingParticles } from "@/components/motion/FloatingParticles";
import { Button } from "@/components/ui/Button";
import { invitationData } from "@/lib/defaults";
import {
  fetchStory,
  fetchStoryVisibility,
  updateStory,
  updateStoryVisibility,
} from "@/lib/api";
import type { StoryItem } from "@/types/invitation";

export default function StoryAdminPage() {
  const [story, setStory] = useState<StoryItem[]>(invitationData.story);
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetchStory(), fetchStoryVisibility()])
      .then(([remoteStory, remoteVisible]) => {
        if (remoteStory?.length) setStory(remoteStory);
        setVisible(remoteVisible);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat cerita."))
      .finally(() => setLoading(false));
  }, []);

  function updateItem(index: number, field: keyof StoryItem, value: string) {
    setStory((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      await Promise.all([updateStory(story), updateStoryVisibility(visible)]);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan cerita.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 sm:py-12">
      <AnimatedGradient className="z-0" />
      <FloatingParticles count={16} className="z-0" />
      <section className="relative z-10 mx-auto max-w-3xl">
        <Link href="/admin-panel" className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[color:var(--text-secondary)] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Kembali ke Admin
        </Link>
        <div className="mb-8 mt-8">
          <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--text-muted)]">Admin Panel</p>
          <h1 className="mt-3 font-serif text-4xl font-bold gold-text">Edit Cerita Cinta</h1>
          <div className="gold-divider mt-5 w-24" aria-hidden />
          <p className="mt-5 text-sm text-[color:var(--text-secondary)]">Kelola teks perjalanan cerita yang tampil di undangan.</p>
          <label className="mt-5 flex w-fit cursor-pointer items-center gap-3 rounded-xl border border-[#D4AF37]/25 px-4 py-3 text-sm text-[color:var(--text-primary)]">
            <input
              type="checkbox"
              checked={visible}
              onChange={(event) => {
                setVisible(event.target.checked);
                setSaved(false);
              }}
              className="h-4 w-4 accent-[#D4AF37]"
            />
            Tampilkan Cerita di Undangan
            <span className="text-xs text-[color:var(--text-muted)]">
              ({visible ? "Aktif" : "Nonaktif"})
            </span>
          </label>
        </div>
        {loading ? (
          <p className="text-sm text-[color:var(--text-muted)]">Memuat cerita...</p>
        ) : (
          <div className="flex flex-col gap-5">
            {story.map((item, index) => (
              <article key={`${index}-${item.year}`} className="card-glass rounded-3xl border border-[#D4AF37]/15 p-6 shadow-[0_4px_32px_rgba(212,175,55,0.08)]">
                <h2 className="mb-4 font-serif text-xl font-semibold text-[color:var(--text-primary)]">Cerita {index + 1}</h2>
                <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
                  <input value={item.year} onChange={(event) => updateItem(index, "year", event.target.value)} placeholder="Tahun" className="rounded-xl border border-[#D4AF37]/30 bg-transparent px-4 py-3 text-sm text-[color:var(--text-primary)]" />
                  <input value={item.title} onChange={(event) => updateItem(index, "title", event.target.value)} placeholder="Judul cerita" className="rounded-xl border border-[#D4AF37]/30 bg-transparent px-4 py-3 text-sm text-[color:var(--text-primary)]" />
                </div>
                <textarea value={item.description} onChange={(event) => updateItem(index, "description", event.target.value)} placeholder="Deskripsi cerita" rows={4} className="mt-4 w-full resize-y rounded-xl border border-[#D4AF37]/30 bg-transparent px-4 py-3 text-sm text-[color:var(--text-primary)]" />
                <Button type="button" variant="ghost" size="sm" className="mt-3" onClick={() => setStory((current) => current.filter((_, itemIndex) => itemIndex !== index))}>
                  <Trash2 className="h-4 w-4" aria-hidden /> Hapus cerita
                </Button>
              </article>
            ))}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="button" variant="outline" onClick={() => setStory((current) => [...current, { year: "", title: "", description: "" }])} className="flex-1 justify-center">
                <Plus className="h-4 w-4" aria-hidden /> Tambah Cerita
              </Button>
              <Button type="button" onClick={save} loading={saving} className="flex-1 justify-center">
                {saved ? <Check className="h-4 w-4" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
                {saved ? "Tersimpan" : "Simpan Cerita"}
              </Button>
            </div>
            {error && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>}
          </div>
        )}
      </section>
    </main>
  );
}
