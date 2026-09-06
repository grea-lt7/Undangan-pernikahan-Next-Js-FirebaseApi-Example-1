"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { GoldShimmerText } from "@/components/motion/GoldShimmerText";
import { FloatingParticles } from "@/components/motion/FloatingParticles";
import { invitationData } from "@/data/invitation";
import { fetchHeader } from "@/lib/api";
import type { HeaderContent } from "@/types/invitation";

export function FooterSection() {
  const [header, setHeader] = useState<HeaderContent>(invitationData.header);

  useEffect(() => {
    fetchHeader()
      .then((remoteHeader) => {
        if (remoteHeader) setHeader({ ...invitationData.header, ...remoteHeader });
      })
      .catch((error) => console.error("Gagal memuat footer dari Firebase:", error));
  }, []);

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
    </footer>
  );
}
