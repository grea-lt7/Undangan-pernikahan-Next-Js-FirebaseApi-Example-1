export interface CoupleInfo {
  groom: string;
  bride: string;
  groomFull: string;
  brideFull: string;
  groomParents: string;
  brideParents: string;
}

export interface EventInfo {
  events: EventDetail[];
}

export interface EventDetail {
  name: string;
  date: string;
  day: string;
  lunarDate: string;
  time: string;
  venue: string;
  address: string;
  city: string;
  mapsUrl: string;
  mapsLabel: string;
  mapsEnabled?: boolean;
}

export interface GiftInfo {
  sectionLabel: string;
  title: string;
  description: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ewalletName: string;
  ewalletHolder: string;
  ewalletNumber: string;
  address: string;
  thankYou: string;
  closingArabic: string;
  accounts: GiftAccount[];
}

export interface GiftAccount {
  label: string;
  holder: string;
  number: string;
}

export interface StoryItem {
  year: string;
  title: string;
  description: string;
}

export interface GalleryImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface HeaderContent {
  label: string;
  groomName: string;
  brideName: string;
  dateText: string;
  locationText: string;
  hashtag: string;
  prayerTitle: string;
  prayerArabic: string;
  prayerTranslation: string;
  footerLabel: string;
  footerShareText: string;
  footerShareEnabled: boolean;
  footerHonorText: string;
  footerMadeWithText: string;
  footerCopyright: string;
}

export interface MusicSettings {
  src: string;
  autoplay: boolean;
}

export type ThemeMode = "light" | "dark" | "system";

export interface ThemeSettings {
  mode: ThemeMode;
}

export interface GuestInvitation {
  name: string;
  share?: Record<string, ShareRecord>;
}

export interface ShareRecord {
  name: string;
  url: string;
  sharedAt: string;
}

export interface InvitationData {
  couple: CoupleInfo;
  event: EventInfo;
  gift: GiftInfo;
  story: StoryItem[];
  gallery: GalleryImage[];
  music: MusicSettings;
  theme: ThemeSettings;
  hashtag: string;
  themeColor: string;
  header: HeaderContent;
  opening: OpeningSettings;
}

export interface OpeningSettings {
  images: string[];
  interval: number;
  enabled: boolean;
}

export type AttendanceStatus = "attending" | "not_attending" | "maybe";

export interface RsvpPayload {
  name: string;
  attendance: AttendanceStatus;
  guestCount: number;
  message: string;
}

export interface GuestbookPayload {
  name: string;
  message: string;
}

export interface GuestbookEntry {
  timestamp: string;
  name: string;
  message: string;
}

export interface RsvpComment {
  id: string;
  name: string;
  attendance: AttendanceStatus;
  guestCount: number;
  message: string;
  createdAt: string;
  replies: RsvpReply[];
}

export interface RsvpReply {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}
