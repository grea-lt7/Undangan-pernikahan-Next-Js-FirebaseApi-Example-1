"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowUp, Check, Eye, EyeOff, Save } from "lucide-react";
import { AnimatedGradient } from "@/components/motion/AnimatedGradient";
import { FloatingParticles } from "@/components/motion/FloatingParticles";
import { Button } from "@/components/ui/Button";
import {
  fetchInvitationSectionSettings,
  updateInvitationSectionSettings,
} from "@/lib/api";
import {
  INVITATION_SECTION_LABELS,
  normalizeSectionSettings,
  type InvitationSectionId,
  type InvitationSectionSettings,
  type UtilityComponentId,
} from "@/lib/sectionSettings";

const utilityLabels = {
  opening: "Layar pembuka undangan",
  music: "Pemutar musik",
  theme: "Tombol ganti tema",
  navigation: "Navigasi mengambang",
} satisfies Record<UtilityComponentId, string>;

export default function SectionsAdminPage() {
  const [settings, setSettings] = useState<InvitationSectionSettings>(
    normalizeSectionSettings(null)
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInvitationSectionSettings()
      .then((remoteSettings) => setSettings(normalizeSectionSettings(remoteSettings)))
      .catch((err) =>
        setError(
          err instanceof Error
            ? err.message
            : "Gagal memuat pengaturan komponen undangan."
        )
      )
      .finally(() => setLoading(false));
  }, []);

  function moveSection(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= settings.order.length) return;

    setSettings((current) => {
      const order = [...current.order];
      [order[index], order[targetIndex]] = [order[targetIndex], order[index]];
      return { ...current, order };
    });
    setSaved(false);
  }

  function setSectionVisibility(id: keyof InvitationSectionSettings["visibility"], visible: boolean) {
    setSettings((current) => ({
      ...current,
      visibility: { ...current.visibility, [id]: visible },
    }));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      await updateInvitationSectionSettings(settings);
      setSaved(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menyimpan pengaturan komponen."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 sm:py-12">
      <AnimatedGradient className="z-0" />
      <FloatingParticles count={16} className="z-0" />
      <section className="relative z-10 mx-auto max-w-3xl">
        <Link
          href="/admin-panel"
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[color:var(--text-secondary)] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> Kembali ke Admin
        </Link>
        <div className="mb-8 mt-8">
          <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--text-muted)]">
            Admin Panel
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold gold-text">
            Urutan & Komponen Undangan
          </h1>
          <div className="gold-divider mt-5 w-24" aria-hidden />
          <p className="mt-4 text-sm text-[color:var(--text-secondary)]">
            Atur urutan bagian undangan dengan tombol panah dan pilih bagian
            yang ingin ditampilkan. Tekan Simpan agar perubahan diterapkan.
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-[color:var(--text-muted)]">
            Memuat pengaturan komponen...
          </p>
        ) : (
          <div className="card-glass rounded-3xl border border-[#D4AF37]/15 p-5 sm:p-8">
            <div className="flex flex-col gap-3">
              {settings.order.map((id, index) => (
                <SectionSettingRow
                  key={id}
                  id={id}
                  label={INVITATION_SECTION_LABELS[id]}
                  index={index}
                  total={settings.order.length}
                  visible={settings.visibility[id]}
                  onMove={moveSection}
                  onVisibilityChange={setSectionVisibility}
                />
              ))}
            </div>

            <div className="mt-8 border-t border-[#D4AF37]/20 pt-6">
              <h2 className="font-serif text-xl font-semibold text-[color:var(--text-primary)]">
                Komponen tambahan
              </h2>
              <div className="mt-4 flex flex-col gap-3">
                {(Object.entries(utilityLabels) as Array<
                  [UtilityComponentId, string]
                >).map(([id, label]) => (
                  <label
                    key={id}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#D4AF37]/20 px-4 py-3 text-sm text-[color:var(--text-primary)]"
                  >
                    <input
                      type="checkbox"
                      checked={settings.visibility[id]}
                      onChange={(event) =>
                        setSectionVisibility(id, event.target.checked)
                      }
                      className="h-4 w-4 accent-[#D4AF37]"
                    />
                    {label}
                    <span className="ml-auto text-xs text-[color:var(--text-muted)]">
                      {settings.visibility[id] ? "Aktif" : "Nonaktif"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <Button
              type="button"
              onClick={save}
              loading={saving}
              className="mt-6 w-full justify-center"
            >
              {saved ? (
                <Check className="h-4 w-4" aria-hidden />
              ) : (
                <Save className="h-4 w-4" aria-hidden />
              )}
              {saved ? "Tersimpan" : "Simpan Pengaturan"}
            </Button>
            {error && (
              <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function SectionSettingRow({
  id,
  label,
  index,
  total,
  visible,
  onMove,
  onVisibilityChange,
}: {
  id: InvitationSectionId;
  label: string;
  index: number;
  total: number;
  visible: boolean;
  onMove: (index: number, direction: -1 | 1) => void;
  onVisibilityChange: (
    id: keyof InvitationSectionSettings["visibility"],
    visible: boolean
  ) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#D4AF37]/20 px-3 py-3 sm:px-4">
      <span className="w-6 shrink-0 text-center text-xs text-[color:var(--text-muted)]">
        {index + 1}
      </span>
      <span className="min-w-0 flex-1 text-sm text-[color:var(--text-primary)]">
        {label}
      </span>
      <button
        type="button"
        onClick={() => onMove(index, -1)}
        disabled={index === 0}
        className="rounded-lg p-2 text-[color:var(--text-secondary)] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] disabled:opacity-30"
        aria-label={`Pindahkan ${label} ke atas`}
      >
        <ArrowUp className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => onMove(index, 1)}
        disabled={index === total - 1}
        className="rounded-lg p-2 text-[color:var(--text-secondary)] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] disabled:opacity-30"
        aria-label={`Pindahkan ${label} ke bawah`}
      >
        <ArrowDown className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => onVisibilityChange(id, !visible)}
        className={`rounded-lg p-2 transition-colors ${
          visible
            ? "text-[#D4AF37] hover:bg-[#D4AF37]/10"
            : "text-[color:var(--text-muted)] hover:bg-[#D4AF37]/10"
        }`}
        aria-label={`${visible ? "Sembunyikan" : "Tampilkan"} ${label}`}
        aria-pressed={visible}
      >
        {visible ? (
          <Eye className="h-4 w-4" aria-hidden />
        ) : (
          <EyeOff className="h-4 w-4" aria-hidden />
        )}
      </button>
    </div>
  );
}
