"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Plus, Save, Trash2 } from "lucide-react";
import { AnimatedGradient } from "@/components/motion/AnimatedGradient";
import { FloatingParticles } from "@/components/motion/FloatingParticles";
import { Button } from "@/components/ui/Button";
import { invitationData } from "@/lib/defaults";
import { fetchOpening, updateOpening } from "@/lib/api";
import { normalizeGalleryUrl } from "@/lib/gallery";

function normalizeOpeningImageUrl(url: string): string {
  const normalized = normalizeGalleryUrl(url);
  const fileId =
    normalized.match(/[?&]id=([^&]+)/)?.[1] ??
    normalized.match(/\/d\/([^/?]+)/)?.[1];

  return fileId
    ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w2000`
    : normalized;
}

export default function OpeningAdminPage() {
  const [images, setImages] = useState(invitationData.opening.images);
  const [interval, setIntervalValue] = useState(invitationData.opening.interval);
  const [enabled, setEnabled] = useState(invitationData.opening.enabled);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOpening()
      .then((opening) => {
        if (opening) {
          setImages(opening.images);
          setIntervalValue(opening.interval);
          setEnabled(opening.enabled);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat gambar pembuka."))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    const cleanImages = images.map(normalizeOpeningImageUrl).filter(Boolean);
    setSaving(true);
    setError("");
    try {
      await updateOpening({
        images: cleanImages,
        interval: Math.max(2000, interval),
        enabled,
      });
      setImages(cleanImages);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan gambar pembuka.");
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
          <h1 className="mt-3 font-serif text-4xl font-bold gold-text">Edit Gambar Pembuka</h1>
          <div className="gold-divider mt-5 w-24" aria-hidden />
          <p className="mt-4 text-sm text-[color:var(--text-secondary)]">
            Tambahkan link gambar biasa atau link berbagi Google Drive. Gambar akan bergantian di layar pembuka.
          </p>
        </div>
        {loading ? <p className="text-sm text-[color:var(--text-muted)]">Memuat gambar pembuka...</p> : (
          <div className="card-glass rounded-3xl border border-[#D4AF37]/15 p-6 sm:p-8">
            <div className="flex flex-col gap-4">
              <label className="flex items-center gap-3 rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-4 text-sm text-[color:var(--text-primary)]">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(event) => {
                    setEnabled(event.target.checked);
                    setSaved(false);
                  }}
                  className="h-4 w-4 accent-[#D4AF37]"
                />
                Aktifkan gambar pembuka
              </label>
              {images.map((image, index) => (
                <div key={`${index}-${image}`} className="flex items-center gap-3">
                  <input
                    value={image}
                    onChange={(event) => {
                      setImages((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item));
                      setSaved(false);
                    }}
                    placeholder="https://drive.google.com/file/d/..."
                    className="min-w-0 flex-1 rounded-xl border border-[#D4AF37]/30 bg-transparent px-4 py-3 text-sm"
                  />
                  <button type="button" onClick={() => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="rounded-lg p-2 text-red-400 hover:bg-red-500/10" aria-label={`Hapus gambar ${index + 1}`}>
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => setImages((current) => [...current, ""])} className="justify-center">
                <Plus className="h-4 w-4" aria-hidden /> Tambah Gambar
              </Button>
              <label className="text-sm text-[color:var(--text-primary)]">
                Durasi pergantian (milidetik)
                <input type="number" min={2000} value={interval} onChange={(event) => { setIntervalValue(Number(event.target.value)); setSaved(false); }} className="mt-2 w-full rounded-xl border border-[#D4AF37]/30 bg-transparent px-4 py-3 text-sm" />
              </label>
              <Button type="button" onClick={save} loading={saving} className="justify-center">
                {saved ? <Check className="h-4 w-4" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
                {saved ? "Tersimpan" : "Simpan Gambar Pembuka"}
              </Button>
              {error && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
