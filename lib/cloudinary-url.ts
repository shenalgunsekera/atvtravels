// Client-safe helpers for Cloudinary delivery URLs.

export function isCloudinaryUrl(url: string) {
  return /^https:\/\/res\.cloudinary\.com\/[^/]+\/(image|video)\/upload\//.test(url);
}

// Insert a transformation right after "/upload/", e.g. "f_auto,q_auto,w_640".
export function cloudinaryTransform(url: string, transformation: string) {
  if (!isCloudinaryUrl(url)) return url;
  return url.replace(/\/upload\//, `/upload/${transformation}/`);
}

// Resized image in the best format the browser supports (WebP/AVIF).
export function cloudinaryImage(url: string, width: number) {
  return cloudinaryTransform(url, `f_auto,q_auto,c_limit,w_${width}`);
}

// Auto quality for videos (keeps the original container format).
export function cloudinaryVideo(url: string) {
  return cloudinaryTransform(url, "q_auto");
}

// First frame of a video as a JPG, for thumbnails.
export function cloudinaryVideoPoster(url: string, width = 640) {
  if (!isCloudinaryUrl(url)) return "";
  return cloudinaryTransform(url, `so_0,c_limit,w_${width}`).replace(/\.[a-z0-9]+$/i, ".jpg");
}
