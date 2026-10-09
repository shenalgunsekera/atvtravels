import Image, { type ImageProps } from "next/image";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// next/image that accepts any URL an admin might enter. Only Unsplash and local files go
// through the optimizer; other hosts and GIFs are served as-is.
export function needsUnoptimized(src: string) {
  if (/\.gif($|\?)/i.test(src)) return true;
  if (src.startsWith("/")) return false;
  try {
    return new URL(src).hostname !== "images.unsplash.com";
  } catch {
    return true;
  }
}

export default function SiteImage({ src, alt, className, unoptimized, ...rest }: Omit<ImageProps, "src"> & { src: string }) {
  if (!src) {
    return (
      <div className={cn("bg-gray-100 flex items-center justify-center text-gray-300", rest.fill && "absolute inset-0", className)}>
        <ImageIcon size={32} />
      </div>
    );
  }
  return (
    <Image src={src} alt={alt} className={className} unoptimized={unoptimized || needsUnoptimized(src)} {...rest} />
  );
}
