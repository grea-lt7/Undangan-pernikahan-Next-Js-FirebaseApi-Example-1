"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Save } from "lucide-react";
import { AnimatedGradient } from "@/components/motion/AnimatedGradient";
import { FloatingParticles } from "@/components/motion/FloatingParticles";
import { Button } from "@/components/ui/Button";
import { invitationData } from "@/lib/defaults";
import { fetchGift, updateGift } from "@/lib/api";
import type { GiftAccount, GiftInfo } from "@/types/invitation";

type GiftTextField = Exclude<keyof GiftInfo, "accounts">;

const fields: Array<[GiftTextField, string]> = [
  ["sectionLabel", "Label section"],
  ["title", "Judul"],
  ["description", "Deskripsi"],
  ["address", "Alamat"],
  ["thankYou", "Ucapan terima kasih"],
  ["closingArabic", "Penutup Arab"],
];

export default function GiftAdminPage() {
  const [gift, setGift] = useState<GiftInfo>(invitationData.gift);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function updateAccount(index: number, field: keyof GiftAccount, value: string) {
    setGift((current) => ({
      ...current,
      accounts: current.accounts.map((account, accountIndex) =>
        accountIndex === index ? { ...account, [field]: value } : account
      ),
    }));
    setSaved(false);
  }

  useEffect(() => {
    fetchGift()
      .then((remoteGift) => {
        if (remoteGift) setGift({ ...invitationData.gift, ...remoteGift });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat informasi hadiah."))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    setError("");
    try {
      await updateGift(gift);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan informasi hadiah.");
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
          <h1 className="mt-3 font-serif text-4xl font-bold gold-text">Edit Wedding Gift</h1>
          <div className="gold-divider mt-5 w-24" aria-hidden />
        </div>
        {loading ? <p className="text-sm text-[color:var(--text-muted)]">Memuat informasi hadiah...</p> : (
          <div className="card-glass rounded-3xl border border-[#D4AF37]/15 p-6 sm:p-8">
            <div className="flex flex-col gap-4">
              {fields.map(([field, label]) => (
                <label key={field} className="text-sm text-[color:var(--text-primary)]">
                  {label}
                  {field === "description" || field === "thankYou" || field === "closingArabic" ? (
                    <textarea rows={field === "description" ? 4 : 2} value={gift[field]} onChange={(event) => { setGift((current) => ({ ...current, [field]: event.target.value })); setSaved(false); }} className="mt-2 w-full rounded-xl border border-[#D4AF37]/30 bg-transparent px-4 py-3 text-sm" />
                  ) : (
                    <input value={gift[field]} onChange={(event) => { setGift((current) => ({ ...current, [field]: event.target.value })); setSaved(false); }} className="mt-2 w-full rounded-xl border border-[#D4AF37]/30 bg-transparent px-4 py-3 text-sm" />
                  )}
                </label>
              ))}
              <div className="mt-3 flex flex-col gap-4">
                <div>
                  <h2 className="font-serif text-xl font-semibold text-[color:var(--text-primary)]">
                    Kartu Rekening / E-Wallet
                  </h2>
                  <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                    Tambahkan kartu sebanyak yang diperlukan.
                  </p>
                </div>
                {gift.accounts.map((account, index) => (
                  <div key={`${index}-${account.label}`} className="rounded-2xl border border-[#D4AF37]/20 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-[#D4AF37]">Kartu {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setGift((current) => ({
                            ...current,
                            accounts: current.accounts.filter((_, accountIndex) => accountIndex !== index),
                          }));
                          setSaved(false);
                        }}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Hapus kartu
                      </button>
                    </div>
                    {([
                      ["label", "Nama bank / e-wallet"],
                      ["holder", "Nama pemilik"],
                      ["number", "Nomor rekening / e-wallet"],
                    ] as Array<[keyof GiftAccount, string]>).map(([field, label]) => (
                      <label key={field} className="mt-3 block text-sm text-[color:var(--text-primary)]">
                        {label}
                        <input
                          value={account[field]}
                          onChange={(event) => updateAccount(index, field, event.target.value)}
                          className="mt-2 w-full rounded-xl border border-[#D4AF37]/30 bg-transparent px-4 py-3 text-sm"
                        />
                      </label>
                    ))}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setGift((current) => ({
                      ...current,
                      accounts: [...current.accounts, { label: "", holder: "", number: "" }],
                    }));
                    setSaved(false);
                  }}
                  className="justify-center"
                >
                  + Tambah Kartu
                </Button>
              </div>
              <Button type="button" onClick={save} loading={saving} className="mt-2 justify-center">
                {saved ? <Check className="h-4 w-4" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
                {saved ? "Tersimpan" : "Simpan Wedding Gift"}
              </Button>
              {error && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
