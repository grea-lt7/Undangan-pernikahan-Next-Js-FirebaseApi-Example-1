"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Copy,
  Link as LinkIcon,
  Trash2,
  UserRound,
} from "lucide-react";
import { AnimatedGradient } from "@/components/motion/AnimatedGradient";
import { FloatingParticles } from "@/components/motion/FloatingParticles";
import { Button } from "@/components/ui/Button";
import { invitationData } from "@/lib/defaults";
import { copyToClipboard } from "@/lib/utils";
import { deleteGuest, fetchGuests, fetchHeader, guestSlug, saveGuest } from "@/lib/api";
import type { HeaderContent } from "@/types/invitation";
export default function AdminPage() {
  const [name, setName] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [header, setHeader] = useState<HeaderContent>(invitationData.header);
  const [guests, setGuests] = useState<Record<string, { name: string }>>({});
  const [guestError, setGuestError] = useState("");
  const [copiedGuest, setCopiedGuest] = useState("");

  useEffect(() => {
    fetchHeader()
      .then((remoteHeader) => {
        if (remoteHeader) setHeader({ ...invitationData.header, ...remoteHeader });
      })
      .catch((error) => console.error("Gagal memuat copyright footer di Admin:", error));
  }, []);

  useEffect(() => {
    fetchGuests()
      .then(setGuests)
      .catch((error) => setGuestError(error instanceof Error ? error.message : "Gagal memuat daftar tamu."));
  }, []);

  async function generateLink() {
    const normalizedName = name.trim();
    if (!normalizedName) return;

    setGuestError("");
    try {
      await saveGuest(normalizedName);
      setGuests((current) => ({ ...current, [guestSlug(normalizedName)]: { name: normalizedName } }));
    } catch (error) {
      setGuestError(error instanceof Error ? error.message : "Gagal menyimpan tamu.");
      return;
    }
    setGeneratedUrl(
      `${window.location.origin}/${encodeURIComponent(normalizedName).replace(/%20/g, "-")}`
    );
    setCopied(false);
  }

  async function removeGuest(slug: string) {
    const guest = guests[slug];
    if (!guest || !window.confirm(`Hapus tamu "${guest.name}"?`)) return;

    setGuestError("");
    try {
      await deleteGuest(slug);
      setGuests((current) => {
        const next = { ...current };
        delete next[slug];
        return next;
      });
    } catch (error) {
      setGuestError(error instanceof Error ? error.message : "Gagal menghapus tamu.");
    }

  }

  async function copyGuestLink(slug: string) {
    const url = `${window.location.origin}/${encodeURIComponent(slug)}`;
    await copyToClipboard(url);
    setCopiedGuest(slug);
    setTimeout(() => setCopiedGuest(""), 2200);
  }

  async function copyLink() {
    if (!generatedUrl) return;
    await copyToClipboard(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 sm:py-12">
      <AnimatedGradient className="z-0" />
      <FloatingParticles count={16} className="z-0" />

      <section className="relative z-10 mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 font-sans text-sm text-[color:var(--text-secondary)] transition-colors hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Kembali ke Undangan
          </Link>
          <span className="hidden rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-3 py-1.5 font-sans text-xs text-[color:var(--text-muted)] sm:inline-flex">
            Admin
          </span>
        </div>
        <nav aria-label="Menu pengaturan admin" className="mb-8">
          <button
            type="button"
            onClick={() => setShowAdminMenu((current) => !current)}
            className="flex min-h-11 w-full items-center justify-between rounded-xl border border-[#D4AF37]/30 px-4 py-3 text-sm text-[#D4AF37] sm:hidden"
            aria-expanded={showAdminMenu}
          >
            Pengaturan Admin
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showAdminMenu ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
          <div
            className={`grid gap-3 overflow-hidden transition-[max-height,opacity] duration-300 sm:grid-cols-2 sm:opacity-100 ${
              showAdminMenu
                ? "mt-3 max-h-[32rem] opacity-100"
                : "max-h-0 opacity-0 sm:mt-0 sm:max-h-none"
            }`}
          >
            {[
              ["/admin/header", "Edit Header Undangan"],
              ["/admin/event", "Edit Informasi Acara"],
              ["/admin/gallery", "Edit Galeri Foto"],
              ["/admin/story", "Edit Cerita Cinta"],
              ["/admin/gift", "Edit Wedding Gift"],
              ["/admin/rsvp", "Komentar RSVP"],
              ["/admin/music", "Edit Musik"],
              ["/admin/theme", "Edit Tema"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[#D4AF37]/30 px-4 py-3 text-center text-sm leading-tight text-[#D4AF37] transition-colors hover:bg-[#D4AF37]/10"
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="mb-8 max-w-2xl">
          <p className="font-sans text-xs uppercase tracking-[0.4em] text-[color:var(--text-muted)]">
            Admin Panel
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold leading-tight gold-text sm:text-5xl">
            Generate Undangan
          </h1>
          <div className="gold-divider mt-5 w-24" aria-hidden />
          <p className="mt-5 max-w-lg font-sans text-sm leading-relaxed text-[color:var(--text-secondary)]">
            Buat link personal untuk setiap tamu agar nama mereka tampil
            otomatis di halaman pembuka undangan.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[1.15fr_0.85fr]">
          <div className="card-glass rounded-3xl border border-[#D4AF37]/15 p-6 shadow-[0_4px_32px_rgba(212,175,55,0.08)] sm:p-8">
            <div className="mb-7 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D4AF37]/15">
                <UserRound className="h-5 w-5 text-[#D4AF37]" aria-hidden />
              </div>
              <div>
                <h2 className="font-serif text-xl font-semibold text-[color:var(--text-primary)]">
                  Tamu Undangan
                </h2>
                <p className="mt-1 font-sans text-xs text-[color:var(--text-muted)]">
                  Masukkan nama lengkap penerima
                </p>
              </div>
            </div>

            <label
              htmlFor="guest-name"
              className="font-sans text-sm font-medium text-[color:var(--text-primary)]"
            >
              Nama tamu
            </label>
            <input
              id="guest-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") generateLink();
              }}
              placeholder="Contoh: Bapak Ahmad"
              className="mt-3 w-full rounded-xl border border-[#D4AF37]/30 bg-transparent px-4 py-3 text-sm text-[color:var(--text-primary)] placeholder:text-[color:var(--text-muted)] focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30"
            />

            <Button
              type="button"
              className="mt-5 w-full justify-center"
              onClick={generateLink}
              disabled={!name.trim()}
              aria-label="Generate link undangan"
            >
              <LinkIcon className="h-4 w-4 shrink-0" aria-hidden />
              Generate Link
            </Button>

            {generatedUrl && (
              <div
                className="mt-6 rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-4"
                aria-live="polite"
              >
                <p className="font-sans text-xs text-[color:var(--text-muted)]">
                  Link undangan berhasil dibuat
                </p>
                <p className="mt-2 break-all font-mono text-sm text-[#D4AF37]">
                  {generatedUrl}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full justify-center"
                  onClick={copyLink}
                  aria-label={copied ? "Link tersalin" : "Salin link undangan"}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 shrink-0" aria-hidden />
                      Link Tersalin
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 shrink-0" aria-hidden />
                      Salin Link
                    </>
                  )}
                </Button>
              </div>
            )}
            {guestError && <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{guestError}</p>}
            <div className="mt-8 border-t border-[#D4AF37]/15 pt-5">
              <h3 className="font-serif text-lg font-semibold text-[color:var(--text-primary)]">Daftar Tamu Tersimpan</h3>
              <div className="mt-3 flex flex-col gap-2">
                {Object.entries(guests).length === 0 ? (
                  <p className="text-sm text-[color:var(--text-muted)]">Belum ada tamu tersimpan.</p>
                ) : Object.entries(guests).map(([slug, guest]) => (
                  <div key={slug} className="flex items-center gap-3 rounded-xl border border-[#D4AF37]/15 px-3 py-2">
                    <span className="min-w-0 flex-1 truncate text-sm text-[color:var(--text-primary)]">{guest.name}</span>
                    <button
                      type="button"
                      onClick={() => copyGuestLink(slug)}
                      className="rounded-lg p-2 text-[#D4AF37] hover:bg-[#D4AF37]/10"
                      aria-label={`Salin link ${guest.name}`}
                    >
                      {copiedGuest === slug ? (
                        <Check className="h-4 w-4" aria-hidden />
                      ) : (
                        <LinkIcon className="h-4 w-4" aria-hidden />
                      )}
                    </button>
                    <button type="button" onClick={() => removeGuest(slug)} className="rounded-lg p-2 text-red-400 hover:bg-red-500/10" aria-label={`Hapus tamu ${guest.name}`}>
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card-glass rounded-3xl border border-[#D4AF37]/15 p-3 text-center shadow-[0_4px_32px_rgba(212,175,55,0.08)] sm:p-4">
            <div className="rounded-2xl border border-[#D4AF37]/20 px-5 py-8 sm:px-7">
              <p className="font-sans text-[10px] uppercase tracking-[0.45em] text-[color:var(--text-muted)]">
                Pratinjau
              </p>
              <div className="mx-auto my-5 flex items-center justify-center gap-3" aria-hidden>
                <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#D4AF37]/60" />
                <span className="h-1.5 w-1.5 rotate-45 bg-[#D4AF37]" />
                <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#D4AF37]/60" />
              </div>
              <p className="font-serif text-2xl font-semibold text-[color:var(--text-primary)]">
                Undangan Pernikahan
              </p>
              <div className="mx-auto my-6 h-px w-16 bg-[#D4AF37]/50" aria-hidden />
              <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
                Kepada Yth
              </p>
              <p className="mt-2 font-serif text-xl font-semibold text-[#D4AF37]">
                {name.trim() || "Nama Tamu"}
              </p>
              <div className="mx-auto my-6 h-px w-16 bg-[#D4AF37]/30" aria-hidden />
              <p className="font-serif text-2xl font-bold gold-text">
                {header.groomName}
              </p>
              <p className="my-2 font-serif text-xl italic text-[#D4AF37]">&amp;</p>
              <p className="font-serif text-2xl font-bold gold-text">
                {header.brideName}
              </p>
            </div>
          </div>
        </div>
        <p className="mt-8 text-center font-sans text-xs text-[color:var(--text-muted)]">
          {header.footerCopyright}
        </p>
      </section>
    </main>
  );
}