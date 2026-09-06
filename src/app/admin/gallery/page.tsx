"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Plus, Save, Trash2 } from "lucide-react";
import { AnimatedGradient } from "@/components/motion/AnimatedGradient";
import { FloatingParticles } from "@/components/motion/FloatingParticles";
import { Button } from "@/components/ui/Button";
import { invitationData } from "@/lib/defaults";
import { fetchGallery, updateGallery } from "@/lib/api";
import { normalizeGalleryUrl } from "@/lib/gallery";
import type { GalleryImage } from "@/types/invitation";

export default function GalleryAdminPage() {
  const [gallery, setGallery] = useState<GalleryImage[]>(invitationData.gallery);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchGallery()
      .then((remoteGallery) => {
        if (remoteGallery?.length) setGallery(remoteGallery);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat galeri."))
      .finally(() => setLoading(false));
  }, []);

  function updateItem(index: number, field: keyof GalleryImage, value: string) {
    setGallery((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: field === "width" || field === "height" ? Number(value) : value }
          : item
      )
    );
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      await updateGallery(
        gallery.map((image) => ({ ...image, src: normalizeGalleryUrl(image.src) }))
      );
      setGallery((current) => current.map((image) => ({ ...image, src: normalizeGalleryUrl(image.src) })));
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan galeri.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 sm:py-12">
      <AnimatedGradient className="z-0" />
      <FloatingParticles count={16} className="z-0" />
      <section className="relative z-10 mx-auto max-w-3xl">
        <Link href="/admin" className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[color:var(--text-secondary)] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Kembali ke Admin
        </Link>
        <div className="mb-8 mt-8">
          <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--text-muted)]">Admin Panel</p>
          <h1 className="mt-3 font-serif text-4xl font-bold gold-text">Edit Galeri Foto</h1>
          <div className="gold-divider mt-5 w-24" aria-hidden />
          <p className="mt-5 text-sm text-[color:var(--text-secondary)]">Masukkan link gambar publik, termasuk link berbagi Google Drive.</p>
        </div>
        {loading ? (
          <p className="text-sm text-[color:var(--text-muted)]">Memuat galeri...</p>
        ) : (
          <div className="flex flex-col gap-5">
            {gallery.map((image, index) => (
              <article key={`${index}-${image.src}`} className="card-glass rounded-3xl border border-[#D4AF37]/15 p-6">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="font-serif text-xl font-semibold text-[color:var(--text-primary)]">Foto {index + 1}</h2>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setGallery((current) => current.filter((_, itemIndex) => itemIndex !== index))}>
                    <Trash2 className="h-4 w-4" aria-hidden /> Hapus
                  </Button>
                </div>
                <input value={image.src} onChange={(event) => updateItem(index, "src", event.target.value)} placeholder="https://drive.google.com/file/d/..." className="mt-4 w-full rounded-xl border border-[#D4AF37]/30 bg-transparent px-4 py-3 text-sm text-[color:var(--text-primary)]" />
                <input value={image.alt} onChange={(event) => updateItem(index, "alt", event.target.value)} placeholder="Deskripsi foto" className="mt-3 w-full rounded-xl border border-[#D4AF37]/30 bg-transparent px-4 py-3 text-sm text-[color:var(--text-primary)]" />
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <input type="number" min="1" value={image.width} onChange={(event) => updateItem(index, "width", event.target.value)} placeholder="Lebar" className="rounded-xl border border-[#D4AF37]/30 bg-transparent px-4 py-3 text-sm text-[color:var(--text-primary)]" />
                  <input type="number" min="1" value={image.height} onChange={(event) => updateItem(index, "height", event.target.value)} placeholder="Tinggi" className="rounded-xl border border-[#D4AF37]/30 bg-transparent px-4 py-3 text-sm text-[color:var(--text-primary)]" />
                </div>
              </article>
            ))}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="button" variant="outline" onClick={() => setGallery((current) => [...current, { src: "", alt: "", width: 800, height: 600 }])} className="flex-1 justify-center">
                <Plus className="h-4 w-4" aria-hidden /> Tambah Foto
              </Button>
              <Button type="button" onClick={save} loading={saving} className="flex-1 justify-center">
                {saved ? <Check className="h-4 w-4" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
                {saved ? "Tersimpan" : "Simpan Galeri"}
              </Button>
            </div>
            {error && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>}
          </div>
        )}
      </section>
    </main>
  );
}
