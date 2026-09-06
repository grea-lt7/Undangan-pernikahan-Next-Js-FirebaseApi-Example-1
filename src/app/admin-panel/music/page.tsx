"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Save } from "lucide-react";
import { AnimatedGradient } from "@/components/motion/AnimatedGradient";
import { FloatingParticles } from "@/components/motion/FloatingParticles";
import { Button } from "@/components/ui/Button";
import { invitationData } from "@/lib/defaults";
import { fetchMusic, updateMusic } from "@/lib/api";
import type { MusicSettings } from "@/types/invitation";

export default function MusicAdminPage() {
  const [music, setMusic] = useState<MusicSettings>(invitationData.music);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMusic()
      .then((remote) => {
        if (remote) setMusic({ ...invitationData.music, ...remote });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat musik."))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    setError("");
    try {
      await updateMusic(music);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan musik.");
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
          <h1 className="mt-3 font-serif text-4xl font-bold gold-text">Edit Musik</h1>
          <div className="gold-divider mt-5 w-24" aria-hidden />
        </div>
        {loading ? (
          <p className="text-sm text-[color:var(--text-muted)]">Memuat musik...</p>
        ) : (
          <div className="card-glass rounded-3xl border border-[#D4AF37]/15 p-6 sm:p-8">
            <label className="text-sm text-[color:var(--text-primary)]">
              Link lagu
              <input value={music.src} onChange={(event) => { setMusic((current) => ({ ...current, src: event.target.value })); setSaved(false); }} placeholder="https://..." className="mt-2 w-full rounded-xl border border-[#D4AF37]/30 bg-transparent px-4 py-3 text-sm" />
            </label>
            <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm text-[color:var(--text-primary)]">
              <input type="checkbox" checked={music.autoplay} onChange={(event) => { setMusic((current) => ({ ...current, autoplay: event.target.checked })); setSaved(false); }} className="h-4 w-4 accent-[#D4AF37]" />
              Aktifkan autoplay
            </label>
            <Button type="button" onClick={save} loading={saving} className="mt-6 w-full justify-center">
              {saved ? <Check className="h-4 w-4" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
              {saved ? "Tersimpan" : "Simpan Musik"}
            </Button>
            {error && <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>}
          </div>
        )}
      </section>
    </main>
  );
}
