"use client";

import type {
  GuestbookApiResponse,
  RsvpApiResponse,
  GuestbookSubmitResponse,
} from "@/types/api";
import type {
  RsvpPayload,
  GuestbookPayload,
  RsvpComment,
  StoryItem,
  GalleryImage,
  HeaderContent,
  EventDetail,
  GiftInfo,
  MusicSettings,
  ThemeSettings,
  GuestInvitation,
  ShareRecord,
} from "@/types/invitation";
import {
  APPS_SCRIPT_URL,
  ACTIONS,
  FIREBASE_DATABASE_URL,
} from "@/lib/constants";
import { sanitizeName, sanitizeMessage } from "@/lib/sanitize";

function getEndpoint(): string {
  if (!APPS_SCRIPT_URL) {
    throw new Error(
      "NEXT_PUBLIC_APPS_SCRIPT_URL belum dikonfigurasi. Periksa .env.local Anda."
    );
  }
  return APPS_SCRIPT_URL;
}

async function postToScript<T>(
  payload: Record<string, unknown>
): Promise<T> {
  const endpoint = getEndpoint();
  const response = await fetch(endpoint, {
    method: "POST",
    // PERBAIKAN: Diubah ke text/plain untuk mengelabui browser agar tidak memicu Preflight OPTIONS (CORS Blocked)
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Gagal menghubungi server`);
  }

  const data: T = await response.json();
  return data;
}

async function getFromScript<T>(params: Record<string, string>): Promise<T> {
  const endpoint = getEndpoint();
  const url = new URL(endpoint);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const response = await fetch(url.toString(), {
    method: "GET",
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Gagal memuat data`);
  }

  const data: T = await response.json();
  return data;
}

export async function submitRsvp(
  payload: RsvpPayload
): Promise<RsvpApiResponse> {
  const sanitized = {
    action: ACTIONS.RSVP,
    name: sanitizeName(payload.name),
    attendance: payload.attendance,
    guestCount: payload.guestCount,
    message: sanitizeMessage(payload.message),
    userAgent:
      typeof navigator !== "undefined"
        ? navigator.userAgent.slice(0, 200)
        : "unknown",
  };

  if (!FIREBASE_DATABASE_URL) {
    throw new Error(
      "NEXT_PUBLIC_FIREBASE_DATABASE_URL belum dikonfigurasi. Periksa .env.local Anda."
    );
  }

  const response = await fetch(
    `${FIREBASE_DATABASE_URL.replace(/\/+$/, "")}/rsvps.json`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...sanitized,
        createdAt: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(15_000),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Gagal menyimpan RSVP ke Firebase`);
  }

  return {
    success: true,
    message: "RSVP berhasil disimpan",
    data: {},
  };
}

export async function submitGuestbook(
  payload: GuestbookPayload
): Promise<GuestbookSubmitResponse> {
  const sanitized = {
    action: ACTIONS.GUESTBOOK,
    name: sanitizeName(payload.name),
    message: sanitizeMessage(payload.message),
    userAgent:
      typeof navigator !== "undefined"
        ? navigator.userAgent.slice(0, 200)
        : "unknown",
  };

  return postToScript<GuestbookSubmitResponse>(sanitized);
}

export async function fetchGuestbook(): Promise<GuestbookApiResponse> {
  return getFromScript<GuestbookApiResponse>({
    action: ACTIONS.GET_GUESTBOOK,
  });
}

export async function fetchRsvpComments(): Promise<RsvpComment[]> {
  if (!FIREBASE_DATABASE_URL) {
    throw new Error("Firebase belum dikonfigurasi.");
  }

  let response: Response;
  try {
    response = await fetch(
      `${FIREBASE_DATABASE_URL.replace(/\/+$/, "")}/rsvps.json`,
      { cache: "no-store", signal: AbortSignal.timeout(20_000) }
    );
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new Error(
        "Firebase tidak merespons. Periksa koneksi internet dan URL Firebase Realtime Database."
      );
    }
    throw error;
  }
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Gagal memuat komentar RSVP`);
  }

  const data = (await response.json()) as Record<string, Record<string, unknown>> | null;
  return Object.entries(data ?? {})
    .filter(([, value]) => value.action === "rsvp")
    .map(([id, value]) => ({
      id,
      name: String(value.name ?? ""),
      attendance: value.attendance as RsvpComment["attendance"],
      guestCount: Number(value.guestCount ?? 1),
      message: String(value.message ?? ""),
      createdAt: String(value.createdAt ?? ""),
      replies: Object.entries(
        (value.replies as Record<string, Record<string, unknown>> | undefined) ?? {}
      ).map(([replyId, reply]) => ({
        id: replyId,
        name: String(reply.name ?? ""),
        message: String(reply.message ?? ""),
        createdAt: String(reply.createdAt ?? ""),
      })),
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function submitRsvpReply(
  rsvpId: string,
  name: string,
  message: string
): Promise<void> {
  if (!FIREBASE_DATABASE_URL) throw new Error("Firebase belum dikonfigurasi.");

  const response = await fetch(
    `${FIREBASE_DATABASE_URL.replace(/\/+$/, "")}/rsvps/${encodeURIComponent(
      rsvpId
    )}/replies.json`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "reply",
        name: sanitizeName(name),
        message: sanitizeMessage(message),
        createdAt: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(15_000),
    }
  );
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Gagal menyimpan balasan`);
  }
}

export async function updateRsvpComment(
  rsvpId: string,
  name: string,
  payload: Pick<RsvpPayload, "attendance" | "guestCount" | "message">
): Promise<void> {
  if (!FIREBASE_DATABASE_URL) throw new Error("Firebase belum dikonfigurasi.");
  const response = await fetch(
    `${FIREBASE_DATABASE_URL.replace(/\/+$/, "")}/rsvps/${encodeURIComponent(rsvpId)}.json`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, name: sanitizeName(name) }),
      signal: AbortSignal.timeout(15_000),
    }
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}: Gagal mengubah RSVP`);
}

export async function deleteRsvpComment(rsvpId: string): Promise<void> {
  if (!FIREBASE_DATABASE_URL) throw new Error("Firebase belum dikonfigurasi.");
  const response = await fetch(
    `${FIREBASE_DATABASE_URL.replace(/\/+$/, "")}/rsvps/${encodeURIComponent(rsvpId)}.json`,
    { method: "DELETE", signal: AbortSignal.timeout(15_000) }
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}: Gagal menghapus RSVP`);
}

export async function updateRsvpReply(
  rsvpId: string,
  replyId: string,
  name: string,
  message: string
): Promise<void> {
  if (!FIREBASE_DATABASE_URL) throw new Error("Firebase belum dikonfigurasi.");
  const response = await fetch(
    `${FIREBASE_DATABASE_URL.replace(/\/+$/, "")}/rsvps/${encodeURIComponent(
      rsvpId
    )}/replies/${encodeURIComponent(replyId)}.json`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "reply",
        name: sanitizeName(name),
        message: sanitizeMessage(message),
      }),
      signal: AbortSignal.timeout(15_000),
    }
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}: Gagal mengubah balasan`);
}

export async function deleteRsvpReply(
  rsvpId: string,
  replyId: string
): Promise<void> {
  if (!FIREBASE_DATABASE_URL) throw new Error("Firebase belum dikonfigurasi.");
  const response = await fetch(
    `${FIREBASE_DATABASE_URL.replace(/\/+$/, "")}/rsvps/${encodeURIComponent(
      rsvpId
    )}/replies/${encodeURIComponent(replyId)}.json`,
    { method: "DELETE", signal: AbortSignal.timeout(15_000) }
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}: Gagal menghapus balasan`);
}

export async function fetchStory(): Promise<StoryItem[] | null> {
  if (!FIREBASE_DATABASE_URL) throw new Error("Firebase belum dikonfigurasi.");
  let response: Response;
  try {
    response = await fetch(
      `${FIREBASE_DATABASE_URL.replace(/\/+$/, "")}/story.json`,
      { cache: "no-store", signal: AbortSignal.timeout(10_000) }
    );
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new Error("Firebase tidak merespons saat memuat cerita.");
    }
    throw error;
  }
  if (!response.ok) throw new Error(`HTTP ${response.status}: Gagal memuat cerita`);

  const data = (await response.json()) as Record<string, StoryItem> | StoryItem[] | null;
  if (!data) return null;
  return Array.isArray(data) ? data : Object.values(data);
}

export async function updateStory(story: StoryItem[]): Promise<void> {
  if (!FIREBASE_DATABASE_URL) throw new Error("Firebase belum dikonfigurasi.");
  const response = await fetch(
    `${FIREBASE_DATABASE_URL.replace(/\/+$/, "")}/story.json`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(story),
      signal: AbortSignal.timeout(15_000),
    }
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}: Gagal menyimpan cerita`);
}

export async function fetchStoryVisibility(): Promise<boolean> {
  if (!FIREBASE_DATABASE_URL) throw new Error("Firebase belum dikonfigurasi.");
  let response: Response;
  try {
    response = await fetch(
      `${FIREBASE_DATABASE_URL.replace(/\/+$/, "")}/storyVisibility.json`,
      { cache: "no-store", signal: AbortSignal.timeout(10_000) }
    );
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new Error("Firebase tidak merespons saat memuat status cerita.");
    }
    throw error;
  }
  if (!response.ok) throw new Error(`HTTP ${response.status}: Gagal memuat status cerita`);
  const value = await response.json();
  return value !== false;
}

export async function updateStoryVisibility(visible: boolean): Promise<void> {
  if (!FIREBASE_DATABASE_URL) throw new Error("Firebase belum dikonfigurasi.");
  const response = await fetch(
    `${FIREBASE_DATABASE_URL.replace(/\/+$/, "")}/storyVisibility.json`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(visible),
      signal: AbortSignal.timeout(15_000),
    }
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}: Gagal menyimpan status cerita`);
}

export async function fetchGallery(): Promise<GalleryImage[] | null> {
  if (!FIREBASE_DATABASE_URL) throw new Error("Firebase belum dikonfigurasi.");
  const response = await fetch(
    `${FIREBASE_DATABASE_URL.replace(/\/+$/, "")}/gallery.json`,
    { signal: AbortSignal.timeout(10_000) }
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}: Gagal memuat galeri`);
  const data = (await response.json()) as Record<string, GalleryImage> | GalleryImage[] | null;
  if (!data) return null;
  return Array.isArray(data) ? data : Object.values(data);
}

export async function updateGallery(gallery: GalleryImage[]): Promise<void> {
  if (!FIREBASE_DATABASE_URL) throw new Error("Firebase belum dikonfigurasi.");
  const response = await fetch(
    `${FIREBASE_DATABASE_URL.replace(/\/+$/, "")}/gallery.json`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(gallery),
      signal: AbortSignal.timeout(15_000),
    }
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}: Gagal menyimpan galeri`);
}

export async function fetchHeader(): Promise<HeaderContent | null> {
  if (!FIREBASE_DATABASE_URL) throw new Error("Firebase belum dikonfigurasi.");
  let response: Response;
  try {
    response = await fetch(
      `${FIREBASE_DATABASE_URL.replace(/\/+$/, "")}/header.json`,
      { cache: "no-store", signal: AbortSignal.timeout(10_000) }
    );
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new Error("Firebase tidak merespons saat memuat header.");
    }
    throw error;
  }
  if (!response.ok) throw new Error(`HTTP ${response.status}: Gagal memuat header`);
  return (await response.json()) as HeaderContent | null;
}

export async function updateHeader(header: HeaderContent): Promise<void> {
  if (!FIREBASE_DATABASE_URL) throw new Error("Firebase belum dikonfigurasi.");
  let response: Response;
  try {
    response = await fetch(
      `${FIREBASE_DATABASE_URL.replace(/\/+$/, "")}/header.json`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(header),
        signal: AbortSignal.timeout(15_000),
      }
    );
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new Error("Firebase tidak merespons saat menyimpan header.");
    }
    throw error;
  }
  if (!response.ok) throw new Error(`HTTP ${response.status}: Gagal menyimpan header`);
}

export async function fetchEvent(): Promise<EventDetail | null> {
  if (!FIREBASE_DATABASE_URL) throw new Error("Firebase belum dikonfigurasi.");
  const response = await fetch(
    `${FIREBASE_DATABASE_URL.replace(/\/+$/, "")}/event.json`,
    { cache: "no-store", signal: AbortSignal.timeout(10_000) }
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}: Gagal memuat informasi acara`);
  return (await response.json()) as EventDetail | null;
}

export async function updateEvent(event: EventDetail): Promise<void> {
  if (!FIREBASE_DATABASE_URL) throw new Error("Firebase belum dikonfigurasi.");
  let response: Response;
  try {
    response = await fetch(
      `${FIREBASE_DATABASE_URL.replace(/\/+$/, "")}/event.json`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
        cache: "no-store",
        signal: AbortSignal.timeout(20_000),
      }
    );
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new Error(
        "Firebase tidak merespons saat menyimpan informasi acara. Periksa koneksi dan URL database."
      );
    }
    throw error;
  }
  if (!response.ok) throw new Error(`HTTP ${response.status}: Gagal menyimpan informasi acara`);
}

export async function fetchGift(): Promise<GiftInfo | null> {
  if (!FIREBASE_DATABASE_URL) throw new Error("Firebase belum dikonfigurasi.");
  const response = await fetch(
    `${FIREBASE_DATABASE_URL.replace(/\/+$/, "")}/gift.json`,
    { cache: "no-store", signal: AbortSignal.timeout(10_000) }
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}: Gagal memuat informasi hadiah`);
  return (await response.json()) as GiftInfo | null;
}

export async function updateGift(gift: GiftInfo): Promise<void> {
  if (!FIREBASE_DATABASE_URL) throw new Error("Firebase belum dikonfigurasi.");
  const response = await fetch(
    `${FIREBASE_DATABASE_URL.replace(/\/+$/, "")}/gift.json`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(gift),
      signal: AbortSignal.timeout(20_000),
    }
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}: Gagal menyimpan informasi hadiah`);
}

export async function fetchMusic(): Promise<MusicSettings | null> {
  if (!FIREBASE_DATABASE_URL) throw new Error("Firebase belum dikonfigurasi.");
  const response = await fetch(
    `${FIREBASE_DATABASE_URL.replace(/\/+$/, "")}/music.json`,
    { cache: "no-store", signal: AbortSignal.timeout(10_000) }
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}: Gagal memuat musik`);
  return (await response.json()) as MusicSettings | null;
}

export async function updateMusic(music: MusicSettings): Promise<void> {
  if (!FIREBASE_DATABASE_URL) throw new Error("Firebase belum dikonfigurasi.");
  const response = await fetch(
    `${FIREBASE_DATABASE_URL.replace(/\/+$/, "")}/music.json`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(music),
      signal: AbortSignal.timeout(20_000),
    }
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}: Gagal menyimpan musik`);
}

export async function fetchTheme(): Promise<ThemeSettings | null> {
  if (!FIREBASE_DATABASE_URL) throw new Error("Firebase belum dikonfigurasi.");
  const response = await fetch(
    `${FIREBASE_DATABASE_URL.replace(/\/+$/, "")}/theme.json`,
    { cache: "no-store", signal: AbortSignal.timeout(10_000) }
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}: Gagal memuat tema`);
  return (await response.json()) as ThemeSettings | null;
}

export async function updateTheme(theme: ThemeSettings): Promise<void> {
  if (!FIREBASE_DATABASE_URL) throw new Error("Firebase belum dikonfigurasi.");
  const response = await fetch(
    `${FIREBASE_DATABASE_URL.replace(/\/+$/, "")}/theme.json`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(theme),
      signal: AbortSignal.timeout(20_000),
    }
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}: Gagal menyimpan tema`);
}

export function guestSlug(name: string): string {
  return encodeURIComponent(name.trim()).replace(/%20/g, "-").toLowerCase();
}

export async function fetchGuests(): Promise<Record<string, GuestInvitation>> {
  if (!FIREBASE_DATABASE_URL) throw new Error("Firebase belum dikonfigurasi.");
  const response = await fetch(
    `${FIREBASE_DATABASE_URL.replace(/\/+$/, "")}/guests.json`,
    { cache: "no-store", signal: AbortSignal.timeout(10_000) }
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}: Gagal memuat daftar tamu`);
  return ((await response.json()) as Record<string, GuestInvitation> | null) ?? {};
}

export async function saveGuest(name: string): Promise<void> {
  if (!FIREBASE_DATABASE_URL) throw new Error("Firebase belum dikonfigurasi.");
  const trimmedName = name.trim();
  const response = await fetch(
    `${FIREBASE_DATABASE_URL.replace(/\/+$/, "")}/guests/${guestSlug(trimmedName)}.json`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmedName }),
      signal: AbortSignal.timeout(15_000),
    }
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}: Gagal menyimpan tamu`);
}

export async function deleteGuest(slug: string): Promise<void> {
  if (!FIREBASE_DATABASE_URL) throw new Error("Firebase belum dikonfigurasi.");
  const response = await fetch(
    `${FIREBASE_DATABASE_URL.replace(/\/+$/, "")}/guests/${encodeURIComponent(slug)}.json`,
    { method: "DELETE", signal: AbortSignal.timeout(15_000) }
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}: Gagal menghapus tamu`);
}

export async function fetchGuest(slug: string): Promise<GuestInvitation | null> {
  if (!FIREBASE_DATABASE_URL) throw new Error("Firebase belum dikonfigurasi.");
  const response = await fetch(
    `${FIREBASE_DATABASE_URL.replace(/\/+$/, "")}/guests/${encodeURIComponent(slug)}.json`,
    { cache: "no-store", signal: AbortSignal.timeout(10_000) }
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}: Gagal memeriksa tamu`);
  return (await response.json()) as GuestInvitation | null;
}

export async function fetchGuestOrSharedGuest(slug: string): Promise<GuestInvitation | null> {
  const directGuest = await fetchGuest(slug);
  if (directGuest) return directGuest;

  const guests = await fetchGuests();
  const sharedGuest = Object.values(guests).find((guest) =>
    Object.keys(guest.share ?? {}).some((shareSlug) => shareSlug === slug)
  );

  return sharedGuest ? { name: slug, share: sharedGuest.share } : null;
}

export async function saveShare(
  sourceName: string,
  recipientName: string,
  url: string
): Promise<void> {
  if (!FIREBASE_DATABASE_URL) throw new Error("Firebase belum dikonfigurasi.");
  const sourceSlug = guestSlug(sourceName);
  const recipientSlug = guestSlug(recipientName);
  const response = await fetch(
    `${FIREBASE_DATABASE_URL.replace(/\/+$/, "")}/guests/${sourceSlug}/share/${recipientSlug}.json`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: recipientName.trim(), url, sharedAt: new Date().toISOString() }),
      signal: AbortSignal.timeout(15_000),
    }
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}: Gagal mencatat pembagian undangan`);
}

export async function deleteShare(sourceName: string, recipientName: string): Promise<void> {
  if (!FIREBASE_DATABASE_URL) throw new Error("Firebase belum dikonfigurasi.");
  const response = await fetch(
    `${FIREBASE_DATABASE_URL.replace(/\/+$/, "")}/guests/${guestSlug(sourceName)}/share/${guestSlug(recipientName)}.json`,
    { method: "DELETE", signal: AbortSignal.timeout(15_000) }
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}: Gagal menghapus riwayat pembagian`);
}

export async function fetchShare(name: string): Promise<ShareRecord | null> {
  if (!FIREBASE_DATABASE_URL) throw new Error("Firebase belum dikonfigurasi.");
  const response = await fetch(
    `${FIREBASE_DATABASE_URL.replace(/\/+$/, "")}/shares/${guestSlug(name)}.json`,
    { cache: "no-store", signal: AbortSignal.timeout(10_000) }
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}: Gagal memuat riwayat pembagian`);
  return (await response.json()) as ShareRecord | null;
}