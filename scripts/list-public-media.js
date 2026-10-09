// Writes lib/public-media.json: the images and videos shipped in /public, so the admin
// media library can list them (serverless functions can't read /public at runtime).
// Runs automatically before `npm run build`.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const DIRS = ["images/gallery", "videos/hero"];
const TYPES = { ".webp": "image", ".jpg": "image", ".jpeg": "image", ".png": "image", ".avif": "image", ".gif": "image", ".mp4": "video", ".webm": "video" };

const items = [];
for (const dir of DIRS) {
  const abs = path.join(root, "public", dir);
  if (!fs.existsSync(abs)) continue;
  for (const name of fs.readdirSync(abs).sort()) {
    const kind = TYPES[path.extname(name).toLowerCase()];
    if (!kind) continue;
    const stat = fs.statSync(path.join(abs, name));
    items.push({ url: `/${dir}/${name}`, name, kind, size: stat.size });
  }
}

fs.writeFileSync(path.join(root, "lib", "public-media.json"), JSON.stringify(items, null, 2) + "\n");
console.log(`public-media: ${items.length} files listed`);
