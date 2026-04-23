// Unsplash image URL helpers.
// Per Unsplash API terms, attribution links must include UTM parameters
// when we use their CDN-hosted images.

const UTM = "utm_source=nordic_recipes&utm_medium=referral";

export function unsplashImageUrl(
  id: string,
  opts: { width: number; height?: number; quality?: number } = { width: 800 }
): string {
  const params = new URLSearchParams();
  params.set("w", String(opts.width));
  if (opts.height) params.set("h", String(opts.height));
  params.set("q", String(opts.quality ?? 75));
  params.set("auto", "format");
  params.set("fit", "crop");
  return `https://images.unsplash.com/photo-${id}?${params.toString()}`;
}

export function unsplashPhotoPageUrl(id: string): string {
  return `https://unsplash.com/photos/${id}?${UTM}`;
}

export function unsplashUserPageUrl(userUrl: string): string {
  const separator = userUrl.includes("?") ? "&" : "?";
  return `${userUrl}${separator}${UTM}`;
}
