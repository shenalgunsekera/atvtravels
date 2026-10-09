// Generates the site favicons from the logo:
//   app/favicon.ico (16/32/48), app/icon.png (512), app/apple-icon.png (180)
// Next.js picks these files up automatically. Usage: node scripts/make-favicon.js [logo]
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const root = path.join(__dirname, "..");
const src = process.argv[2] || path.join(root, "public/images/gallery/Logo.webp");

// Trim the white border, then centre the mark on a white square with a little breathing room.
async function square(size, paddingRatio) {
  const trimmed = await sharp(src).trim({ background: "#ffffff", threshold: 40 }).toBuffer();
  const inner = Math.round(size * (1 - paddingRatio * 2));
  const mark = await sharp(trimmed)
    .resize(inner, inner, { fit: "contain", background: "#ffffff" })
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: "#ffffff" } })
    .composite([{ input: mark, gravity: "center" }])
    .png()
    .toBuffer();
}

// ICO file containing PNG images (supported by all modern browsers).
function toIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  let offset = 6 + pngs.length * 16;
  const entries = pngs.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}

(async () => {
  const ico = await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await square(size, 0.04) })));
  fs.writeFileSync(path.join(root, "app/favicon.ico"), toIco(ico));
  fs.writeFileSync(path.join(root, "app/icon.png"), await square(512, 0.08));
  fs.writeFileSync(path.join(root, "app/apple-icon.png"), await square(180, 0.12));
  console.log("Wrote app/favicon.ico, app/icon.png, app/apple-icon.png");
})();
