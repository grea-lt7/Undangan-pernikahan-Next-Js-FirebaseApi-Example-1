"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoldShimmerText } from "@/components/motion/GoldShimmerText";
import { FloatingParticles } from "@/components/motion/FloatingParticles";
import { AnimatedGradient } from "@/components/motion/AnimatedGradient";
import { invitationData } from "@/lib/defaults";
import { fetchHeader, fetchOpening } from "@/lib/api";
import type { HeaderContent } from "@/types/invitation";
import { normalizeGalleryUrl } from "@/lib/gallery";
import { useTheme } from "@/providers/ThemeProvider";

interface OpeningScreenProps {
  guestName: string;
  onOpen: () => void;
}

function normalizeOpeningImageUrl(url: string): string {
  const normalized = normalizeGalleryUrl(url);
  const fileId =
    normalized.match(/[?&]id=([^&]+)/)?.[1] ??
    normalized.match(/\/d\/([^/?]+)/)?.[1];

  return fileId
    ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w2000`
    : normalized;
}

export function OpeningScreen({ guestName, onOpen }: OpeningScreenProps) {
  const { resolvedTheme } = useTheme();
  const [closing, setClosing] = useState(false);
  const [header, setHeader] = useState<HeaderContent>(invitationData.header);
  const [openingImages, setOpeningImages] = useState<string[]>(invitationData.opening.images);
  const [imageInterval, setImageInterval] = useState(invitationData.opening.interval);
  const [openingEnabled, setOpeningEnabled] = useState(invitationData.opening.enabled);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    fetchHeader()
      .then((remoteHeader) => {
        if (remoteHeader) {
          setHeader({ ...invitationData.header, ...remoteHeader });
        }
      })
      .catch((error) => {
        console.warn("Header Firebase tidak tersedia; memakai data lokal.", error);
      });
  }, []);

  useEffect(() => {
    fetchOpening()
      .then((opening) => {
        if (opening) {
          setOpeningImages(
            opening.images.map(normalizeOpeningImageUrl).filter(Boolean)
          );
          setImageInterval(Math.max(2000, opening.interval));
          setOpeningEnabled(opening.enabled);
          setActiveImage(0);
        }
      })
      .catch((error) => console.warn("Gambar pembuka Firebase tidak tersedia; memakai data lokal.", error));
  }, []);

  useEffect(() => {
    if (openingImages.length < 2) return;
    const timer = window.setInterval(
      () => setActiveImage((current) => (current + 1) % openingImages.length),
      imageInterval
    );
    return () => window.clearInterval(timer);
  }, [imageInterval, openingImages.length]);

  function handleOpen() {
    setClosing(true);
    setTimeout(onOpen, 900);
  }

  return (
    <AnimatePresence>
      {!closing ? (
        <motion.div
          key="opening"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.05,
            filter: "blur(8px)",
            transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "var(--bg-primary)" }}
          role="dialog"
          aria-modal="true"
          aria-label="Layar pembuka undangan pernikahan"
        >
          <AnimatedGradient className="z-0" />
          <FloatingParticles count={20} className="z-0" />

          {openingEnabled && openingImages.length > 0 && (
            <div className="absolute inset-0 z-0" aria-hidden>
              {openingImages.map((image, index) => (
                <img
                  key={`${image}-${index}`}
                  src={image}
                  alt=""
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                    index === activeImage ? "opacity-75" : "opacity-0"
                  }`}
                />
              ))}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    resolvedTheme === "dark"
                      ? "rgba(11, 10, 8, 0.48)"
                      : "rgba(255, 248, 231, 0.18)",
                }}
              />
            </div>
          )}

          <div className="relative z-10 max-h-[calc(100vh-5rem)] overflow-y-auto px-4 py-4">
            <div className="rounded-3xl border border-white/25 bg-white/10 p-3 shadow-[0_4px_32px_rgba(0,0,0,0.16)] backdrop-blur-xl sm:p-4 dark:border-white/15 dark:bg-black/20">
              <div className="flex flex-col items-center gap-7 rounded-2xl border border-white/20 bg-white/10 px-5 py-8 text-center shadow-inner backdrop-blur-2xl sm:px-8 dark:border-white/10 dark:bg-black/15">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
              className="flex flex-col items-center gap-1"
            >
              <span className="font-serif text-2xl font-semibold text-[color:var(--text-primary)]">
                Undangan Pernikahan
              </span>
              <div className="mx-auto my-5 flex items-center justify-center gap-3" aria-hidden>
                <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#D4AF37]/60" />
                <span className="h-1.5 w-1.5 rotate-45 bg-[#D4AF37]" />
                <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#D4AF37]/60" />
              </div>
            </motion.div>

            {guestName && guestName !== "Tamu Undangan" && (
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="w-full rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-6 py-4"
              >
                <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
                  Kepada Yth
                </p>
                <p className="mt-2 font-serif text-xl font-semibold text-[#D4AF37]">
                  {guestName}
                </p>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: [0.19, 1, 0.22, 1] }}
              className="flex w-full flex-col items-center gap-2"
            >
              <div className="mx-auto my-1 h-px w-16 bg-[#D4AF37]/30" aria-hidden />
              <GoldShimmerText
                text={header.groomName}
                size="lg"
                as="h1"
                className="leading-tight"
              />
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9, duration: 0.4 }}
                className="font-serif text-2xl italic text-[#D4AF37]/70"
                aria-hidden
              >
                &
              </motion.span>
              <GoldShimmerText
                text={header.brideName}
                size="lg"
                as="h1"
                className="leading-tight"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.1, ease: [0.19, 1, 0.22, 1] }}
              className="flex flex-col items-center gap-1"
            >
              <p className="font-sans text-sm text-[color:var(--text-muted)]">
                {header.dateText}
              </p>
              <p className="font-sans text-sm text-[color:var(--text-muted)]">
                {header.locationText}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.6, ease: [0.19, 1, 0.22, 1] }}
            >
              <motion.button
                onClick={handleOpen}
                className="group relative overflow-hidden rounded-full bg-[#D4AF37] px-10 py-4 font-sans text-sm font-semibold text-[#2A1E12] shadow-[0_8px_32px_rgba(212,175,55,0.4)]"
                whileHover={{
                  scale: 1.04,
                  boxShadow: "0 12px 40px rgba(212,175,55,0.55)",
                }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.5 }}
                  aria-hidden
                />
                Buka Undangan
              </motion.button>
            </motion.div>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.8 }}
            className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-1"
            aria-hidden
          >
            <motion.div
              className="h-8 w-0.5 bg-gradient-to-b from-[#D4AF37]/50 to-transparent"
              animate={{ scaleY: [1, 0, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
              Scroll
            </span>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
