"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Save } from "lucide-react";
import { AnimatedGradient } from "@/components/motion/AnimatedGradient";
import { FloatingParticles } from "@/components/motion/FloatingParticles";
import { Button } from "@/components/ui/Button";
import { invitationData } from "@/lib/defaults";
import { fetchEvent, updateEvent } from "@/lib/api";
import type { EventDetail, EventInfo } from "@/types/invitation";

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
  const [event, setEvent] = useState<EventInfo>(invitationData.event);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEvent()
      .then((remoteEvent) => {
        if (remoteEvent) {
          const events = remoteEvent.events.map((detail) => ({ ...detail }));
          if (events.length === 1) {
            events.push({
              ...events[0],
              name: "Resepsi",
              time: "10:00 - 12:00",
              mapsEnabled: true,
            });
          }
          setEvent({ events });
        }
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

  function addEvent() {
    setEvent((current) => ({
      events: [
        ...current.events,
        {
          ...current.events[0],
          name: "Resepsi",
          time: "10:00 - 12:00",
          mapsEnabled: true,
        },
      ],
    }));
    setSaved(false);
  }

  function removeEvent(index: number) {
    if (event.events.length === 1) return;
    setEvent((current) => ({
      events: current.events.filter((_, eventIndex) => eventIndex !== index),
    }));
    setSaved(false);
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
          <h1 className="mt-3 font-serif text-4xl font-bold gold-text">Edit Informasi Acara</h1>
          <div className="gold-divider mt-5 w-24" aria-hidden />
        </div>
        {loading ? <p className="text-sm text-[color:var(--text-muted)]">Memuat informasi acara...</p> : (
          <div className="flex flex-col gap-6">
            {event.events.map((eventDetail, eventIndex) => (
              <div key={eventIndex} className="card-glass rounded-3xl border border-[#D4AF37]/15 p-6 shadow-[0_4px_24px_rgba(212,175,55,0.08)] sm:p-8">
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
                    Acara {eventIndex + 1}
                  </p>
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="mt-2 font-serif text-2xl font-semibold text-[color:var(--text-primary)]">
                      {eventDetail.name || `Acara ${eventIndex + 1}`}
                    </h2>
                    {event.events.length > 1 && (
                      <button type="button" onClick={() => removeEvent(eventIndex)} className="text-xs text-red-400 hover:text-red-300">
                        Hapus acara
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[color:var(--text-muted)]">
                    Isi detail acara ini. Kartu kosong tidak akan ditampilkan di undangan.
                  </p>
                </div>
                <div className="flex flex-col gap-4">
                  {fields.map(([field, label]) => (
                    <label key={field} className="text-sm text-[color:var(--text-primary)]">
                      {label}
                      <input
                        type={field === "date" ? "date" : "text"}
                        value={
                          typeof eventDetail[field] === "string"
                            ? eventDetail[field]
                            : ""
                        }
                        onChange={(e) => {
                          setEvent((current) => ({
                            events: current.events.map((detail, index) =>
                              index === eventIndex ? { ...detail, [field]: e.target.value } : detail
                            ),
                          }));
                          setSaved(false);
                        }}
                        className="mt-2 w-full rounded-xl border border-[#D4AF37]/30 bg-transparent px-4 py-3 text-sm"
                      />
                    </label>
                  ))}
                  <label className="flex items-center gap-3 rounded-xl border border-[#D4AF37]/20 px-4 py-3 text-sm text-[color:var(--text-primary)]">
                    <input
                      type="checkbox"
                      checked={eventDetail.mapsEnabled !== false}
                      onChange={(e) => {
                        setEvent((current) => ({
                          events: current.events.map((detail, index) =>
                            index === eventIndex
                              ? { ...detail, mapsEnabled: e.target.checked }
                              : detail
                          ),
                        }));
                        setSaved(false);
                      }}
                      className="h-4 w-4 accent-[#D4AF37]"
                    />
                    Tampilkan peta Google Maps di undangan
                  </label>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addEvent} className="w-full justify-center">
              + Tambah Acara
            </Button>
            <div>
              <Button type="button" onClick={save} loading={saving} className="w-full justify-center">
                {saved ? <Check className="h-4 w-4" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
                {saved ? "Tersimpan" : "Simpan Semua Informasi Acara"}
              </Button>
              {error && <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
