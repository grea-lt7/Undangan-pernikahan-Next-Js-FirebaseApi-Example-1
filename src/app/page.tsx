"use client";

import { useEffect, useMemo, useState, useSyncExternalStore, Suspense } from "react";
import dynamic from "next/dynamic";
import { OpeningScreen } from "@/components/sections/OpeningScreen";
import { HeroSection } from "@/components/sections/HeroSection";
import { CountdownSection } from "@/components/sections/CountdownSection";
import { EventDetailsSection } from "@/components/sections/EventDetailsSection";
import { StorySection } from "@/components/sections/StorySection";
import { RsvpSection } from "@/components/sections/RsvpSection";
import { GiftSection } from "@/components/sections/GiftSection";
import { FooterSection } from "@/components/sections/FooterSection";
import { CoHostsSection } from "@/components/sections/CoHostsSection";
import { FloatingNavigation } from "@/components/FloatingNavigation";
import { MusicPlayer } from "@/components/MusicPlayer";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LoadingState } from "@/components/ui/LoadingState";
import {
  fetchInvitationSectionSettings,
} from "@/lib/api";
import {
  DEFAULT_SECTION_SETTINGS,
  normalizeSectionSettings,
  type InvitationSectionId,
  type InvitationSectionSettings,
} from "@/lib/sectionSettings";

const GallerySection = dynamic(
  () =>
    import("@/components/sections/GallerySection").then(
      (m) => m.GallerySection
    ),
  { loading: () => <LoadingState message="Memuat galeri..." className="py-24" /> }
);

function getGuestNameFromUrl(): string {
    const params = new URLSearchParams(window.location.search);
    const pathName = window.location.pathname.split("/").filter(Boolean)[0] ?? "";
    const raw = pathName || params.get("to") || params.get("name") || "";
    if (!raw) return "Tamu Undangan";

    const decoded = decodeURIComponent(raw)
      .replace(/[-_]+/g, " ")
      .trim()
      .slice(0, 80);
    return decoded || "Tamu Undangan";
}

function useGuestNameFromUrl(): string {
  return useSyncExternalStore(
    () => () => {},
    getGuestNameFromUrl,
    () => "Tamu Undangan"
  );
}

export default function WeddingPage() {
  const [opened, setOpened] = useState(false);
  const [sectionSettings, setSectionSettings] =
    useState<InvitationSectionSettings>(DEFAULT_SECTION_SETTINGS);
  const guestName = useGuestNameFromUrl();
  const visibleSectionIds = useMemo(
    () =>
      sectionSettings.order.filter((id) => sectionSettings.visibility[id]),
    [sectionSettings.order, sectionSettings.visibility]
  );

  useEffect(() => {
    fetchInvitationSectionSettings()
      .then((settings) => {
        const normalizedSettings = normalizeSectionSettings(settings);
        setSectionSettings(normalizedSettings);
        if (!normalizedSettings.visibility.opening) setOpened(true);
      })
      .catch((error) =>
        console.error("Gagal memuat urutan dan visibilitas komponen:", error)
      );
  }, []);

  function renderSection(id: InvitationSectionId) {
    switch (id) {
      case "hero":
        return <HeroSection key={id} />;
      case "countdown":
        return <CountdownSection key={id} />;
      case "event":
        return <EventDetailsSection key={id} />;
      case "gallery":
        return (
          <Suspense
            key={id}
            fallback={
              <LoadingState message="Memuat galeri..." className="py-24" />
            }
          >
            <GallerySection />
          </Suspense>
        );
      case "story":
        return <StorySection key={id} />;
      case "gift":
        return <GiftSection key={id} />;
      case "rsvp":
        return <RsvpSection key={id} />;
      case "coHosts":
        return <CoHostsSection key={id} />;
      case "footer":
        return <FooterSection key={id} />;
    }
  }

  return (
    <>
      {!opened && sectionSettings.visibility.opening && (
        <OpeningScreen guestName={guestName} onOpen={() => setOpened(true)} />
      )}

      {(opened || !sectionSettings.visibility.opening) && (
        <>
          <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
            {sectionSettings.visibility.music && <MusicPlayer />}
            {sectionSettings.visibility.theme && <ThemeToggle />}
          </div>

          {sectionSettings.visibility.navigation && (
            <FloatingNavigation visibleSections={visibleSectionIds} />
          )}

          <main id="main-content" tabIndex={-1}>
            {visibleSectionIds.map(renderSection)}
          </main>
        </>
      )}
    </>
  );
}
