"use client";

import { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { OpeningScreen } from "@/components/sections/OpeningScreen";
import { HeroSection } from "@/components/sections/HeroSection";
import { CountdownSection } from "@/components/sections/CountdownSection";
import { EventDetailsSection } from "@/components/sections/EventDetailsSection";
import { StorySection } from "@/components/sections/StorySection";
import { RsvpSection } from "@/components/sections/RsvpSection";
import { GiftSection } from "@/components/sections/GiftSection";
import { FooterSection } from "@/components/sections/FooterSection";
import { FloatingNavigation } from "@/components/FloatingNavigation";
import { MusicPlayer } from "@/components/MusicPlayer";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LoadingState } from "@/components/ui/LoadingState";

const GallerySection = dynamic(
  () =>
    import("@/components/sections/GallerySection").then(
      (m) => m.GallerySection
    ),
  { loading: () => <LoadingState message="Memuat galeri..." className="py-24" /> }
);

function useGuestNameFromUrl(): string {
  const [guestName, setGuestName] = useState("Tamu Undangan");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pathName = window.location.pathname.split("/").filter(Boolean)[0] ?? "";
    const raw = pathName || params.get("to") || params.get("name") || "";
    if (!raw) return;

    const decoded = decodeURIComponent(raw)
      .replace(/[-_]+/g, " ")
      .trim()
      .slice(0, 80);
    if (decoded) setGuestName(decoded);
  }, []);

  return guestName;
}

export default function WeddingPage() {
  const [opened, setOpened] = useState(false);
  const guestName = useGuestNameFromUrl();

  return (
    <>
      {!opened && (
        <OpeningScreen guestName={guestName} onOpen={() => setOpened(true)} />
      )}

      {opened && (
        <>
          <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
            <MusicPlayer />
            <ThemeToggle />
          </div>

          <FloatingNavigation />

          <main id="main-content" tabIndex={-1}>
            <HeroSection />
            <CountdownSection />
            <EventDetailsSection />
            <Suspense
              fallback={
                <LoadingState message="Memuat galeri..." className="py-24" />
              }
            >
              <GallerySection />
            </Suspense>
            <StorySection />
            <GiftSection />
            <RsvpSection />
            <FooterSection />
          </main>
        </>
      )}
    </>
  );
}
