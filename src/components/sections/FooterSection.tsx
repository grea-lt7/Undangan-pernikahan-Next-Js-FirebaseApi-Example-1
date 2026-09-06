"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Heart, MessageCircle, Share2, Trash2, X } from "lucide-react";
import { GoldShimmerText } from "@/components/motion/GoldShimmerText";
import { FloatingParticles } from "@/components/motion/FloatingParticles";
import { invitationData } from "@/lib/defaults";
import { deleteShare, fetchGuest, fetchHeader, guestSlug, saveShare } from "@/lib/api";
import type { HeaderContent, ShareRecord } from "@/types/invitation";

export function FooterSection() {
  const [header, setHeader] = useState<HeaderContent>(invitationData.header);
  const [showShare, setShowShare] = useState(false);
  const [shareName, setShareName] = useState("");
  const [shareError, setShareError] = useState("");
  const [sharing, setSharing] = useState(false);
  const [guestCanShare, setGuestCanShare] = useState(false);
  const [generatedShareUrl, setGeneratedShareUrl] = useState("");
  const [copiedShareUrl, setCopiedShareUrl] = useState(false);
  const [copiedRecipient, setCopiedRecipient] = useState("");
  const [currentGuestName, setCurrentGuestName] = useState("");
  const [shareHistory, setShareHistory] = useState<ShareRecord[]>([]);

  useEffect(() => {
    fetchHeader()
      .then((remoteHeader) => {
        if (remoteHeader) setHeader({ ...invitationData.header, ...remoteHeader });
      })
      .catch((error) => console.error("Gagal memuat footer dari Firebase:", error));
  }, []);

  useEffect(() => {
    const pathName = window.location.pathname.split("/").filter(Boolean)[0] ?? "";
    if (!pathName || pathName === "admin") return;

    const guestName = decodeURIComponent(pathName).replace(/[-_]+/g, " ").trim().slice(0, 80);
    if (!guestName) return;
    setCurrentGuestName(guestName);

    fetchGuest(guestSlug(guestName))
      .then(async (guest) => {
        setGuestCanShare(Boolean(guest));
        if (!guest) return;
        const history = Object.values(guest.share ?? {});
        setShareHistory(history);
        const latestShare = history.at(-1);
        if (latestShare?.url) setGeneratedShareUrl(latestShare.url);
      })
      .catch((error) => console.error("Gagal memeriksa akses berbagi:", error));
  }, []);

  async function shareInvitation(event: React.FormEvent) {
    event.preventDefault();
    const name = shareName.trim();
    if (!name) return;
    setSharing(true);
    setShareError("");
    const url = `${window.location.origin}/${encodeURIComponent(name).replace(/%20/g, "-")}`;
    try {
      await saveShare(currentGuestName, name, url);
      setGeneratedShareUrl(url);
      setCopiedShareUrl(false);
    } catch (error) {
      setShareError(error instanceof Error ? error.message : "Gagal membagikan undangan.");
    } finally {
      setSharing(false);
    }
  }

  async function copyGeneratedShareUrl() {
    if (!generatedShareUrl) return;
    await navigator.clipboard.writeText(generatedShareUrl);
    setCopiedShareUrl(true);
  }

  function shareViaWhatsApp(url: string, recipientName?: string) {
    const greeting = recipientName ? `Halo ${recipientName},` : "Halo,";
    const message = `${greeting} berikut link undangan pernikahannya: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  async function copyRecipientLink(recipient: string) {
    const url = `${window.location.origin}/${encodeURIComponent(recipient).replace(/%20/g, "-")}`;
    await navigator.clipboard.writeText(url);
    setCopiedRecipient(recipient);
    setTimeout(() => setCopiedRecipient(""), 2200);
  }

  async function removeRecipientShare(recipient: ShareRecord) {
    if (!currentGuestName || !window.confirm(`Hapus riwayat share untuk "${recipient.name}"?`)) return;
    try {
      await deleteShare(currentGuestName, recipient.name);
      setShareHistory((current) => current.filter((share) => share.name !== recipient.name));
      if (generatedShareUrl === recipient.url) setGeneratedShareUrl("");
    } catch (error) {
      setShareError(error instanceof Error ? error.message : "Gagal menghapus riwayat share.");
    }
  }

  return (
    <footer
      id="footer"
      className="relative overflow-hidden pt-24 pb-12 section-padding"
      aria-label="Footer undangan"
    >
      <FloatingParticles count={14} className="z-0" />

      <div
        className="absolute inset-0 z-0 pointer-events-none"
        aria-hidden
      >
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#D4AF37]/25 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#D4AF37]/3 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl flex flex-col items-center gap-10 text-center">
        <div className="flex flex-col items-center gap-2">
          <span className="font-sans text-xs uppercase tracking-[0.4em] text-[color:var(--text-muted)]">
            {header.footerLabel}
          </span>
          <div className="gold-divider w-16 my-2" aria-hidden />
          <GoldShimmerText
            text={header.groomName}
            as="p"
            size="xl"
            className="leading-tight"
          />
          <p className="font-serif text-xl italic text-[#D4AF37]">&amp;</p>
          <GoldShimmerText
            text={header.brideName}
            as="p"
            size="xl"
            className="leading-tight"
          />
          <p className="mt-2 font-sans text-sm text-[color:var(--text-muted)] tracking-wider">
            {header.hashtag}
          </p>
        </div>

        <div className="gold-divider w-full" aria-hidden />

        <div className="flex flex-col items-center gap-3">
          {header.footerShareEnabled && guestCanShare && (
            <div className="flex max-w-sm flex-col items-center gap-3">
              <p className="font-sans text-xs text-[color:var(--text-muted)] leading-relaxed text-center">
                {header.footerShareText}
              </p>
              <button
                type="button"
                onClick={() => setShowShare(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-[#D4AF37]/40 px-4 py-2 text-sm text-[#D4AF37] hover:bg-[#D4AF37]/10"
              >
                <Share2 className="h-4 w-4" aria-hidden />
                Bagikan Undangan
              </button>
            </div>
          )}
          <p className="font-sans text-xs text-[color:var(--text-muted)] leading-relaxed max-w-sm">
            {header.footerHonorText}
          </p>
          <div className="flex items-center gap-2 text-xs text-[color:var(--text-muted)]">
            <span>Dibuat dengan</span>
            <Heart className="h-3 w-3 text-[#D4AF37]" aria-hidden />
            <span>{header.footerMadeWithText}</span>
          </div>
          <p className="font-sans text-xs text-[color:var(--text-muted)]/60">
            {header.footerCopyright}
          </p>
        </div>
      </div>
      {showShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" role="dialog" aria-modal="true" aria-labelledby="share-title">
          <form onSubmit={shareInvitation} className="card-glass w-full max-w-md rounded-3xl border border-[#D4AF37]/25 p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <h2 id="share-title" className="font-serif text-xl font-semibold text-[color:var(--text-primary)]">Bagikan Undangan</h2>
              <button type="button" onClick={() => setShowShare(false)} className="rounded-lg p-2 text-[color:var(--text-muted)] hover:bg-[#D4AF37]/10" aria-label="Tutup popup">
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <label className="mt-5 block text-sm text-[color:var(--text-primary)]">
              Nama penerima
              <input value={shareName} onChange={(event) => setShareName(event.target.value)} className="mt-2 w-full rounded-xl border border-[#D4AF37]/30 bg-transparent px-4 py-3" placeholder="Contoh: Ahmad" autoFocus required />
            </label>
            <button type="submit" disabled={sharing} className="mt-5 w-full rounded-xl bg-[#D4AF37] px-4 py-3 text-sm font-semibold text-[#2A1E12] disabled:opacity-60">
              {sharing ? "Menyimpan..." : generatedShareUrl ? "Perbarui Link" : "Buat Link"}
            </button>
            {generatedShareUrl && (
              <div className="mt-4 rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-3">
                <p className="break-all text-left font-mono text-xs text-[#D4AF37]">{generatedShareUrl}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={copyGeneratedShareUrl}
                    className="rounded-lg border border-[#D4AF37]/30 px-3 py-2 text-sm text-[#D4AF37] hover:bg-[#D4AF37]/10"
                  >
                    {copiedShareUrl ? "Link Tersalin" : "Salin Link"}
                  </button>
                  <button
                    type="button"
                    onClick={() => shareViaWhatsApp(generatedShareUrl, shareName.trim() || undefined)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-3 py-2 text-sm font-medium text-white hover:bg-[#20bd5a]"
                    aria-label="Bagikan link melalui WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden />
                    WhatsApp
                  </button>
                </div>
              </div>
            )}
            {shareHistory.length > 0 && (
              <div className="mt-4 text-left">
                <p className="text-xs text-[color:var(--text-muted)]">Pernah membagikan kepada:</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {shareHistory.map((recipient) => (
                    <li key={recipient.name} className="flex items-center gap-1 rounded-full bg-[#D4AF37]/10 pl-3 pr-1 py-1 text-xs text-[#D4AF37]">
                      {recipient.name}
                      <button
                        type="button"
                        onClick={() => copyRecipientLink(recipient.name)}
                        className="rounded-full p-1 hover:bg-[#D4AF37]/15"
                        aria-label={`Salin link ${recipient.name}`}
                      >
                        {copiedRecipient === recipient.name ? (
                          <Check className="h-3 w-3" aria-hidden />
                        ) : (
                          <Copy className="h-3 w-3" aria-hidden />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => shareViaWhatsApp(recipient.url, recipient.name)}
                        className="rounded-full p-1 text-[#25D366] hover:bg-[#25D366]/10"
                        aria-label={`Bagikan link ${recipient.name} melalui WhatsApp`}
                      >
                        <MessageCircle className="h-3 w-3" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeRecipientShare(recipient)}
                        className="rounded-full p-1 text-red-400 hover:bg-red-500/10"
                        aria-label={`Hapus riwayat share ${recipient.name}`}
                      >
                        <Trash2 className="h-3 w-3" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {shareError && <p className="mt-3 text-sm text-red-400">{shareError}</p>}
          </form>
        </div>
      )}
    </footer>
  );
}
