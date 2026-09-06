"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Save } from "lucide-react";
import { AnimatedGradient } from "@/components/motion/AnimatedGradient";
import { FloatingParticles } from "@/components/motion/FloatingParticles";
import { Button } from "@/components/ui/Button";
import { invitationData } from "@/lib/defaults";
import { fetchEvent, updateEvent } from "@/lib/api";
import type { EventDetail } from "@/types/invitation";

const fields: Array<[keyof EventDetail, string]> = [
  ["name", "Nama acara"],
  ["date", "Tanggal (YYYY-MM-DD)"],
  ["day", "Hari"],
  ["lunarDate", "Tanggal Hijriah"],
  ["time", "Waktu"],
  ["venue", "Judul tempat"],
  ["address", "Alamat"],
  ["city", "Kecamatan / Kabupaten"],
  ["mapsUrl", "Link Google Maps"],
  ["mapsLabel", "Label Google Maps"],
];

export default function EventAdminPage() {
  const [event, setEvent] = useState<EventDetail>(invitationData.event.akad);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEvent()
      .then((remoteEvent) => {
        if (remoteEvent) setEvent({ ...invitationData.event.akad, ...remoteEvent });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat informasi acara."))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    setError("");
    try {
      await updateEvent(event);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan informasi acara.");
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
          <h1 className="mt-3 font-serif text-4xl font-bold gold-text">Edit Informasi Acara</h1>
          <div className="gold-divider mt-5 w-24" aria-hidden />
        </div>
        {loading ? <p className="text-sm text-[color:var(--text-muted)]">Memuat informasi acara...</p> : (
          <div className="card-glass rounded-3xl border border-[#D4AF37]/15 p-6 sm:p-8">
            <div className="flex flex-col gap-4">
              {fields.map(([field, label]) => (
                <label key={field} className="text-sm text-[color:var(--text-primary)]">
                  {label}
                  <input type={field === "date" ? "date" : "text"} value={event[field]} onChange={(e) => { setEvent((current) => ({ ...current, [field]: e.target.value })); setSaved(false); }} className="mt-2 w-full rounded-xl border border-[#D4AF37]/30 bg-transparent px-4 py-3 text-sm" />
                </label>
              ))}
              <Button type="button" onClick={save} loading={saving} className="mt-2 justify-center">
                {saved ? <Check className="h-4 w-4" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
                {saved ? "Tersimpan" : "Simpan Informasi Acara"}
              </Button>
              {error && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
