export type DriveThumbSize = 'w256' | 'w800' | 'w1920';

export function getDriveFileId(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const match = trimmed.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
  if (match?.[1]) return match[1];

  const idParam = trimmed.match(/drive\.google\.com\/(?:open|uc)\?[^#]*id=([^&]+)/i);
  if (idParam?.[1]) return idParam[1];

  const idInUrl = trimmed.match(/[?&]id=([^&]+)/i);
  if (idInUrl?.[1]) return idInUrl[1];

  return null;
}

/**
 * For Google Drive links, convert share URLs into image-friendly URLs.
 * Attempt 0: thumbnail API; 1: uc export=view; 2: uc export=download.
 * For non-Drive URLs, returns the trimmed URL.
 */
export function getProfileImageUrlForAttempt(
  url?: string | null,
  attempt: number = 0,
  size: DriveThumbSize = 'w256'
): string | null {
  const trimmed = url?.trim() || '';
  if (!trimmed) return null;

  const fileId = getDriveFileId(trimmed);
  if (!fileId) return trimmed;

  if (attempt === 0) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`;
  }
  if (attempt === 1) {
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  if (attempt === 2) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  return null;
}
