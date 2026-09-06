export function normalizeGalleryUrl(url: string): string {
  const trimmed = url.trim();
  const fileId =
    trimmed.match(/\/file\/d\/([^/]+)/)?.[1] ??
    trimmed.match(/[?&]id=([^&]+)/)?.[1];

  return fileId
    ? `https://drive.google.com/uc?export=view&id=${fileId}`
    : trimmed;
}

export function normalizeAudioUrl(url: string): string {
  const trimmed = url.trim();
  const fileId =
    trimmed.match(/\/file\/d\/([^/]+)/)?.[1] ??
    trimmed.match(/[?&]id=([^&]+)/)?.[1];

  return fileId
    ? `/api/music?id=${encodeURIComponent(fileId)}`
    : trimmed;
}
