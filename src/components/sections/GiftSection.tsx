"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Gift } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { invitationData } from "@/data/invitation";
import { copyToClipboard } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { fetchGift } from "@/lib/api";
import type { GiftAccount, GiftInfo } from "@/types/invitation";

interface AccountCardProps {
  label: string;
  holder: string;
  number: string;
}

function AccountCard({ label, holder, number }: AccountCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(text: string) {
    try {
      await copyToClipboard(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard API tidak tersedia di beberapa browser lama
    }
  }

  return (
    <div className="card-glass rounded-3xl border border-[#D4AF37]/15 overflow-hidden shadow-[0_4px_32px_rgba(212,175,55,0.08)]">
      <div className="bg-gradient-to-br from-[#D4AF37]/10 to-transparent p-6 pb-4 border-b border-[#D4AF37]/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4AF37]/15">
            <Gift className="h-5 w-5 text-[#D4AF37]" aria-hidden />
          </div>
          <div>
            <p className="font-sans text-xs uppercase tracking-widest text-[color:var(--text-muted)]">
              Transfer ke
            </p>
            <p className="font-serif text-base font-semibold text-[color:var(--text-primary)]">
              {label}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <p className="font-sans text-xs text-[color:var(--text-muted)]">
            Atas Nama
          </p>
          <p className="font-serif text-lg font-semibold text-[color:var(--text-primary)]">
            {holder}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-sans text-xs text-[color:var(--text-muted)]">
            Nomor Rekening
          </p>
          <div className="flex items-center gap-3">
            <p className="font-mono text-xl font-bold tracking-widest text-[#D4AF37]">
              {number}
            </p>
            <motion.button
              onClick={() => handleCopy(number)}
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-300",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]",
                copied
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                  : "border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/60"
              )}
              whileTap={{ scale: 0.9 }}
              aria-label={
                copied
                  ? "Nomor rekening tersalin"
                  : "Salin nomor rekening"
              }
            >
              <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Check className="h-4 w-4" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Copy className="h-4 w-4" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
          <AnimatePresence>
            {copied && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-emerald-400"
                role="status"
                aria-live="polite"
              >
                Nomor rekening tersalin ke clipboard
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export function GiftSection() {
  const [gift, setGift] = useState<GiftInfo>(invitationData.gift);

  useEffect(() => {
    fetchGift()
      .then((remoteGift) => {
        if (remoteGift) setGift({ ...invitationData.gift, ...remoteGift });
      })
      .catch((error) => console.error("Gagal memuat informasi hadiah dari Firebase:", error));
  }, []);

  const accounts: GiftAccount[] =
    gift.accounts?.length > 0
      ? gift.accounts
      : [
          {
            label: `Bank ${gift.bankName}`,
            holder: gift.accountHolder,
            number: gift.accountNumber,
          },
          {
            label: gift.ewalletName,
            holder: gift.ewalletHolder,
            number: gift.ewalletNumber,
          },
        ];

  return (
    <section
      id="gift"
      className="py-24 section-padding overflow-hidden"
      aria-label="Informasi hadiah dan rekening"
    >
      <div className="mx-auto max-w-md">
        <Reveal direction="up">
          <div className="mb-12 flex flex-col items-center gap-3 text-center">
            <span className="font-sans text-xs uppercase tracking-[0.4em] text-[color:var(--text-muted)]">
              {gift.sectionLabel}
            </span>
            <h2 className="font-serif text-3xl font-bold gold-text sm:text-4xl">
              {gift.title}
            </h2>
            <div className="gold-divider w-24" aria-hidden />
            <p className="font-sans text-sm text-[color:var(--text-secondary)] max-w-sm text-balance leading-relaxed">
              {gift.description}
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.15} direction="up">
          <div className="flex flex-col gap-5">
            {accounts.map((account, index) => (
              <AccountCard
                key={`${account.label}-${index}`}
                label={account.label}
                holder={account.holder}
                number={account.number}
              />
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.25} direction="up">
          <div className="mt-6 flex flex-col gap-4 text-center font-sans text-xs text-[color:var(--text-muted)] leading-relaxed">
            <p>{gift.address}</p>
            <p>{gift.thankYou}</p>
            <p className="font-serif text-base" dir="rtl">
              {gift.closingArabic}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
