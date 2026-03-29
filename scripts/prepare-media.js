/**
 * Converts all customer photos to WebP and copies hero videos to public/.
 * Run once: node scripts/prepare-media.js
 */

const sharp = require("../node_modules/sharp");
const fs    = require("fs");
const path  = require("path");

// ── Source paths ─────────────────────────────────────────────────────────────
const PHOTO_SOURCES = [
  "C:/Users/MSI/Desktop/Adeesha photos",
  "C:/Users/MSI/Desktop/saj photos",
  "C:/Users/MSI/Desktop/Shenals Photos",
];

const VIDEO_SOURCES = [
  "C:/Users/MSI/Desktop",          // root desktop videos (Oct-2025 travel videos)
  "C:/Users/MSI/Desktop/Adeesha photos", // videos inside photo folder
];

// ── Dest paths ────────────────────────────────────────────────────────────────
const OUT_GALLERY = "D:/Adeeshas Project/public/images/gallery";
const OUT_HERO    = "D:/Adeeshas Project/public/videos/hero";

// ── Setup ─────────────────────────────────────────────────────────────────────
[OUT_GALLERY, OUT_HERO].forEach(d => fs.mkdirSync(d, { recursive: true }));

// ── Convert photos → WebP ─────────────────────────────────────────────────────
async function convertPhotos() {
  let idx = 1;
  for (const srcDir of PHOTO_SOURCES) {
    if (!fs.existsSync(srcDir)) { console.log("SKIP (not found):", srcDir); continue; }
    const files = fs.readdirSync(srcDir).filter(f => /\.(jpe?g|png)$/i.test(f));
    for (const file of files) {
      const src  = path.join(srcDir, file);
      const dest = path.join(OUT_GALLERY, `photo-${String(idx).padStart(3, "0")}.webp`);
      try {
        await sharp(src)
          .resize(900, 650, { fit: "cover", position: "attention" })
          .webp({ quality: 82, effort: 4 })
          .toFile(dest);
        process.stdout.write(`\r  Images: ${idx} converted`);
        idx++;
      } catch (e) {
        console.error("\nFailed:", file, e.message);
      }
    }
  }
  console.log(`\n✓ ${idx - 1} images → WebP`);
}

// ── Copy / rename videos ───────────────────────────────────────────────────────
function copyVideos() {
  let idx = 1;

  // Desktop root: only WhatsApp 2025-10-31 videos
  const desktop = "C:/Users/MSI/Desktop";
  if (fs.existsSync(desktop)) {
    const desktopVideos = fs.readdirSync(desktop)
      .filter(f => /WhatsApp Video 2025/.test(f) && f.endsWith(".mp4"));
    for (const f of desktopVideos) {
      const dest = path.join(OUT_HERO, `hero-${String(idx).padStart(2, "0")}.mp4`);
      fs.copyFileSync(path.join(desktop, f), dest);
      console.log(`  Copied hero-${String(idx).padStart(2,"0")}.mp4 ← ${f}`);
      idx++;
    }
  }

  // Adeesha photos folder: mp4 videos
  const adeeshaDir = "C:/Users/MSI/Desktop/Adeesha photos";
  if (fs.existsSync(adeeshaDir)) {
    const adeeshaVideos = fs.readdirSync(adeeshaDir).filter(f => f.endsWith(".mp4"));
    for (const f of adeeshaVideos) {
      const dest = path.join(OUT_HERO, `hero-${String(idx).padStart(2, "0")}.mp4`);
      fs.copyFileSync(path.join(adeeshaDir, f), dest);
      console.log(`  Copied hero-${String(idx).padStart(2,"0")}.mp4 ← ${f}`);
      idx++;
    }
  }

  console.log(`✓ ${idx - 1} videos copied`);
}

// ── Run ───────────────────────────────────────────────────────────────────────
(async () => {
  console.log("── Copying videos ──────────────────────────────────");
  copyVideos();
  console.log("── Converting photos to WebP ────────────────────────");
  await convertPhotos();
  console.log("\n✅  All done. Files are in public/images/gallery/ and public/videos/hero/");
})();
