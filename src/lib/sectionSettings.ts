export const INVITATION_SECTION_IDS = [
  "hero",
  "countdown",
  "event",
  "gallery",
  "story",
  "gift",
  "rsvp",
  "coHosts",
  "footer",
] as const;

export const INVITATION_SECTION_LABELS: Record<
  (typeof INVITATION_SECTION_IDS)[number],
  string
> = {
  hero: "Beranda / Mempelai",
  countdown: "Hitung Mundur",
  event: "Informasi Acara",
  gallery: "Galeri Foto",
  story: "Cerita Cinta",
  gift: "Wedding Gift",
  rsvp: "RSVP dan Komentar",
  coHosts: "Turut Mengundang",
  footer: "Footer / Bagikan Undangan",
};

export type InvitationSectionId = (typeof INVITATION_SECTION_IDS)[number];
export type UtilityComponentId =
  | "opening"
  | "music"
  | "theme"
  | "navigation";
export type SectionVisibility = Record<
  InvitationSectionId | UtilityComponentId,
  boolean
>;

export const DEFAULT_SECTION_SETTINGS: InvitationSectionSettings = {
  order: [...INVITATION_SECTION_IDS],
  visibility: {
    hero: true,
    countdown: true,
    event: true,
    gallery: true,
    story: true,
    gift: true,
    rsvp: true,
    coHosts: true,
    footer: true,
    opening: true,
    music: true,
    theme: true,
    navigation: true,
  },
};

export interface InvitationSectionSettings {
  order: InvitationSectionId[];
  visibility: SectionVisibility;
}

export function normalizeSectionSettings(
  value: Partial<InvitationSectionSettings> | null
): InvitationSectionSettings {
  const configuredOrder = Array.isArray(value?.order)
    ? value.order.filter(
        (id): id is InvitationSectionId =>
          INVITATION_SECTION_IDS.includes(id as InvitationSectionId)
      )
    : [];
  const order = [
    ...configuredOrder,
    ...INVITATION_SECTION_IDS.filter((id) => !configuredOrder.includes(id)),
  ];
  const visibility = { ...DEFAULT_SECTION_SETTINGS.visibility };

  if (value?.visibility && typeof value.visibility === "object") {
    for (const id of Object.keys(visibility) as Array<keyof SectionVisibility>) {
      const configuredValue = value.visibility[id];
      if (typeof configuredValue === "boolean") visibility[id] = configuredValue;
    }
  }

  return { order, visibility };
}
