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

const DEFAULT_IMAGE_DIMENSION = { width: 800, height: 600 };

function getAutoImageDimensions(src: string) {
  if (!src) {
    return Promise.resolve(DEFAULT_IMAGE_DIMENSION);
  }

  return new Promise<{ width: number; height: number }>((resolve) => {
    const img = new window.Image();

    img.onload = () => {
      resolve({
        width: img.naturalWidth || img.width || DEFAULT_IMAGE_DIMENSION.width,
        height: img.naturalHeight || img.height || DEFAULT_IMAGE_DIMENSION.height,
      });
    };

    img.onerror = () => {
      resolve(DEFAULT_IMAGE_DIMENSION);
    };

    img.src = src;
  });
}

export default function GalleryAdminPage() {
  const [gallery, setGallery] = useState<GalleryImage[]>(invitationData.gallery);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchGallery()
      .then(async (remoteGallery) => {
        if (!remoteGallery?.length) {
          setLoading(false);
          return;
        }

        const hydratedGallery = await Promise.all(
          remoteGallery.map(async (image) => {
            if (image.src && (!image.width || !image.height)) {
              const dimensions = await getAutoImageDimensions(normalizeGalleryUrl(image.src) || image.src);
              return { ...image, ...dimensions };
            }
            return image;
          })
        );

        setGallery(hydratedGallery);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat galeri."))
      .finally(() => setLoading(false));
  }, []);

  async function syncImageDimensions(index: number, source: string) {
    const normalizedSource = normalizeGalleryUrl(source);
    if (!normalizedSource) {
      setGallery((current) =>
        current.map((item, itemIndex) =>
          itemIndex === index ? { ...item, src: "", width: DEFAULT_IMAGE_DIMENSION.width, height: DEFAULT_IMAGE_DIMENSION.height } : item
        )
      );
      return;
    }

    const dimensions = await getAutoImageDimensions(normalizedSource);
    setGallery((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, src: normalizedSource, ...dimensions }
          : item
      )
    );
  }

  function updateItem(index: number, field: keyof GalleryImage, value: string) {
    setGallery((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: field === "width" || field === "height" ? Number(value) : value }
          : item
      )
    );

    if (field === "src") {
      void syncImageDimensions(index, value);
    }

    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setError("");

    try {
      const normalizedGallery = await Promise.all(
        gallery.map(async (image) => {
          const normalizedSrc = normalizeGalleryUrl(image.src);
          const safeSrc = normalizedSrc || image.src;

          if (!safeSrc) {
            return { ...image, src: "", width: DEFAULT_IMAGE_DIMENSION.width, height: DEFAULT_IMAGE_DIMENSION.height };
          }

          const dimensions = await getAutoImageDimensions(safeSrc);
          return { ...image, src: safeSrc, ...dimensions };
        })
      );

      await updateGallery(normalizedGallery);
      setGallery(normalizedGallery);
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
        <Link href="/admin-panel" className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[color:var(--text-secondary)] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]">
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
                <div className="mt-3 rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-4 py-3 text-sm text-[color:var(--text-secondary)]">
                  Ukuran otomatis: {image.width > 0 && image.height > 0 ? `${image.width} × ${image.height}` : "Sedang mendeteksi..."}
                </div>
              </article>
            ))}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="button" variant="outline" onClick={() => setGallery((current) => [...current, { src: "", alt: "", width: DEFAULT_IMAGE_DIMENSION.width, height: DEFAULT_IMAGE_DIMENSION.height }])} className="flex-1 justify-center">
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
