"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Moon, Save, Sun, Laptop } from "lucide-react";
import { AnimatedGradient } from "@/components/motion/AnimatedGradient";
import { FloatingParticles } from "@/components/motion/FloatingParticles";
import { Button } from "@/components/ui/Button";
import { invitationData } from "@/lib/defaults";
import { fetchTheme, updateTheme } from "@/lib/api";
import type { ThemeMode, ThemeSettings } from "@/types/invitation";
import { useTheme } from "@/providers/ThemeProvider";

const options: { value: ThemeMode; label: string; description: string }[] = [
  { value: "system", label: "Otomatis", description: "Mengikuti mode terang/gelap perangkat tamu." },
  { value: "light", label: "Cerah", description: "Selalu menggunakan tampilan cerah." },
  { value: "dark", label: "Gelap", description: "Selalu menggunakan tampilan gelap." },
];

const icons = { system: Laptop, light: Sun, dark: Moon };

export default function ThemeAdminPage() {
  const { setTheme: applyTheme } = useTheme();
  const [theme, setTheme] = useState<ThemeSettings>(invitationData.theme);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTheme()
      .then((remote) => {
        if (remote) setTheme({ ...invitationData.theme, ...remote });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat tema."))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    setError("");
    try {
      await updateTheme(theme);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan tema.");
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
          <h1 className="mt-3 font-serif text-4xl font-bold gold-text">Edit Tema</h1>
          <div className="gold-divider mt-5 w-24" aria-hidden />
        </div>
        {loading ? (
          <p className="text-sm text-[color:var(--text-muted)]">Memuat tema...</p>
        ) : (
          <div className="card-glass rounded-3xl border border-[#D4AF37]/15 p-6 sm:p-8">
            <p className="text-sm text-[color:var(--text-secondary)]">
              Pilih tampilan undangan untuk semua tamu. Pilihan ini disimpan di Firebase.
            </p>
            <div className="mt-5 grid gap-3">
              {options.map((option) => {
                const Icon = icons[option.value];
                const selected = theme.mode === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => { setTheme({ mode: option.value }); applyTheme(option.value); setSaved(false); }}
                    className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-colors ${selected ? "border-[#D4AF37] bg-[#D4AF37]/10" : "border-[#D4AF37]/20 hover:bg-[#D4AF37]/5"}`}
                    aria-pressed={selected}
                  >
                    <Icon className="h-5 w-5 shrink-0 text-[#D4AF37]" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-[color:var(--text-primary)]">{option.label}</span>
                      <span className="mt-1 block text-xs text-[color:var(--text-muted)]">{option.description}</span>
                    </span>
                    {selected && <Check className="h-5 w-5 shrink-0 text-[#D4AF37]" aria-hidden />}
                  </button>
                );
              })}
            </div>
            <Button type="button" onClick={save} loading={saving} className="mt-6 w-full justify-center">
              {saved ? <Check className="h-4 w-4" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
              {saved ? "Tersimpan" : "Simpan Tema"}
            </Button>
            {error && <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>}
          </div>
        )}
      </section>
    </main>
  );
}
