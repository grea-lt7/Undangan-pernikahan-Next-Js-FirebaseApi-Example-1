"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { StaggerText } from "@/components/motion/StaggerText";
import { FloatingParticles } from "@/components/motion/FloatingParticles";
import { AnimatedGradient } from "@/components/motion/AnimatedGradient";
import { Reveal } from "@/components/motion/Reveal";
import { invitationData } from "@/lib/defaults";
import { fetchHeader } from "@/lib/api";
import type { HeaderContent } from "@/types/invitation";

export function HeroSection() {
  const [header, setHeader] = useState<HeaderContent>(invitationData.header);

  useEffect(() => {
    fetchHeader()
      .then((remoteHeader) => {
        if (remoteHeader) setHeader(remoteHeader);
      })
      .catch((error) => console.error("Gagal memuat header dari Firebase:", error));
  }, []);

  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden py-24 section-padding"
      aria-label="Nama pasangan pengantin"
    >
      <AnimatedGradient className="z-0" />
      <FloatingParticles count={22} className="z-0" />

      <div className="absolute inset-0 z-0" aria-hidden>
        <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
        <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
          className="flex flex-col items-center gap-3"
        >
          <span className="font-sans text-xs uppercase tracking-[0.4em] text-[color:var(--text-muted)]">
            {header.label}
          </span>
          <div className="gold-divider w-16" aria-hidden />
        </motion.div>

        <div className="flex flex-col items-center gap-3">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.4, ease: [0.19, 1, 0.22, 1] }}
            className="gold-shimmer-text font-serif text-5xl font-bold leading-tight tracking-wide sm:text-6xl md:text-7xl lg:text-8xl"
          >
            {header.groomName}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="ornament-line w-48"
            aria-hidden
          >
            <span className="font-serif text-2xl italic text-[#D4AF37]">&</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.5, ease: [0.19, 1, 0.22, 1] }}
            className="gold-shimmer-text font-serif text-5xl font-bold leading-tight tracking-wide sm:text-6xl md:text-7xl lg:text-8xl"
          >
            {header.brideName}
          </motion.h1>
        </div>

        <Reveal delay={0.9} direction="up">
          <div className="flex flex-col items-center gap-4">
            <div className="gold-divider w-32" aria-hidden />
            <div className="flex flex-col items-center gap-1.5">
              <p className="font-sans text-sm font-medium uppercase tracking-[0.25em] text-[#D4AF37]">
                {header.dateText}
              </p>
              <p className="font-sans text-sm text-[color:var(--text-muted)]">
                {header.locationText}
              </p>
            </div>
            <p className="font-sans text-xs text-[color:var(--text-muted)] tracking-wider">
              {header.hashtag}
            </p>
          </div>
        </Reveal>

        <Reveal delay={1.1} direction="up">
          <div className="flex flex-col items-center gap-2 pt-4">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
              {header.prayerTitle}
            </p>
            <p
              className="font-serif text-lg text-[color:var(--text-secondary)] max-w-sm text-balance leading-relaxed"
              dir="rtl"
            >
              {header.prayerArabic}
            </p>
            <p className="font-sans text-xs text-[color:var(--text-muted)] max-w-sm leading-relaxed">
              {header.prayerTranslation}
            </p>
          </div>
        </Reveal>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        <div className="h-10 w-5 rounded-full border border-[#D4AF37]/30 flex items-start justify-center pt-1.5">
          <div className="h-2.5 w-0.5 rounded-full bg-[#D4AF37]/60" />
        </div>
      </motion.div>
    </section>
  );
}
