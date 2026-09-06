"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Save } from "lucide-react";
import { AnimatedGradient } from "@/components/motion/AnimatedGradient";
import { FloatingParticles } from "@/components/motion/FloatingParticles";
import { Button } from "@/components/ui/Button";
import { invitationData } from "@/lib/defaults";
import { fetchHeader, updateHeader } from "@/lib/api";
import type { HeaderContent } from "@/types/invitation";

const fields: Array<[Exclude<keyof HeaderContent, "footerShareEnabled">, string]> = [
  ["label", "Label atas"],
  ["groomName", "Nama mempelai pria"],
  ["brideName", "Nama mempelai wanita"],
  ["dateText", "Tanggal"],
  ["locationText", "Lokasi"],
  ["hashtag", "Hashtag"],
  ["prayerTitle", "Judul doa"],
  ["prayerArabic", "Doa Arab"],
  ["prayerTranslation", "Terjemahan doa"],
  ["footerLabel", "Footer: Label"],
  ["footerShareText", "Footer: Teks berbagi"],
  ["footerHonorText", "Footer: Teks kehormatan"],
  ["footerMadeWithText", "Footer: Teks dibuat dengan"],
  ["footerCopyright", "Footer: Copyright"],
];

export default function HeaderAdminPage() {
  const [header, setHeader] = useState<HeaderContent>(invitationData.header);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHeader()
      .then((remoteHeader) => {
        if (remoteHeader) setHeader({ ...invitationData.header, ...remoteHeader });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat header."))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    setError("");
    try {
      await updateHeader(header);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan header.");
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
          <h1 className="mt-3 font-serif text-4xl font-bold gold-text">Edit Header Undangan</h1>
          <div className="gold-divider mt-5 w-24" aria-hidden />
        </div>
        {loading ? <p className="text-sm text-[color:var(--text-muted)]">Memuat header...</p> : (
          <div className="card-glass rounded-3xl border border-[#D4AF37]/15 p-6 sm:p-8">
            <div className="flex flex-col gap-4">
              {fields.map(([field, label], index) => (
                <div key={field}>
                  {index === 9 && (
                    <div className="mb-5 mt-4 border-t border-[#D4AF37]/25 pt-5">
                      <p className="font-serif text-xl font-semibold text-[#D4AF37]">
                        Bagian Bawah Undangan (Footer)
                      </p>
                      <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                        Atur teks yang tampil di bagian paling bawah undangan.
                      </p>
                    </div>
                  )}
                  <label className="text-sm text-[color:var(--text-primary)]">
                    {label}
                    {field === "prayerTranslation" || field === "prayerArabic" || field === "footerShareText" || field === "footerHonorText" || field === "footerMadeWithText" ? (
                      <textarea rows={field === "footerHonorText" || field === "footerShareText" ? 3 : 2} value={header[field]} onChange={(event) => { setHeader((current) => ({ ...current, [field]: event.target.value })); setSaved(false); }} className="mt-2 w-full rounded-xl border border-[#D4AF37]/30 bg-transparent px-4 py-3 text-sm" />
                    ) : (
                      <input value={header[field]} onChange={(event) => { setHeader((current) => ({ ...current, [field]: event.target.value })); setSaved(false); }} className="mt-2 w-full rounded-xl border border-[#D4AF37]/30 bg-transparent px-4 py-3 text-sm" />
                    )}
                  </label>
                </div>
              ))}
              <label className="flex items-center gap-3 rounded-xl border border-[#D4AF37]/20 p-4 text-sm text-[color:var(--text-primary)]">
                <input
                  type="checkbox"
                  checked={header.footerShareEnabled}
                  onChange={(event) => {
                    setHeader((current) => ({ ...current, footerShareEnabled: event.target.checked }));
                    setSaved(false);
                  }}
                  className="h-4 w-4 accent-[#D4AF37]"
                />
                Tampilkan tombol Bagikan Undangan
              </label>
              <Button type="button" onClick={save} loading={saving} className="mt-2 justify-center">
                {saved ? <Check className="h-4 w-4" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
                {saved ? "Tersimpan" : "Simpan Header"}
              </Button>
              {error && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
