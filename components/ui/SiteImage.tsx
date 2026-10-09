"use client";

import Image, { type ImageLoaderProps, type ImageProps } from "next/image";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { cloudinaryImage, isCloudinaryUrl } from "@/lib/cloudinary-url";

// Cloudinary resizes and converts its own images, so they skip Vercel's optimizer.
const cloudinaryLoader = ({ src, width }: ImageLoaderProps) => cloudinaryImage(src, width);

// next/image that accepts any URL an admin might enter. Unsplash and local files go through
// the Next optimizer, Cloudinary through its own CDN; other hosts and GIFs are served as-is.
export function needsUnoptimized(src: string) {
  if (/\.gif($|\?)/i.test(src)) return true;
  if (src.startsWith("/")) return false;
  try {
    return new URL(src).hostname !== "images.unsplash.com";
  } catch {
    return true;
  }
}

export default function SiteImage({ src, alt, className, unoptimized, ...rest }: Omit<ImageProps, "src" | "loader"> & { src: string }) {
  if (!src) {
    return (
      <div className={cn("bg-gray-100 flex items-center justify-center text-gray-300", rest.fill && "absolute inset-0", className)}>
        <ImageIcon size={32} />
      </div>
    );
  }
  if (isCloudinaryUrl(src)) {
    return <Image src={src} alt={alt} className={className} loader={cloudinaryLoader} {...rest} />;
  }
  return <Image src={src} alt={alt} className={className} unoptimized={unoptimized || needsUnoptimized(src)} {...rest} />;
}
