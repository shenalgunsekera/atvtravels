/* eslint-disable no-console */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const inputArg = process.argv[2] || "public/videos/hero/hero.mp4";
const crfArg = Number(process.argv[3] || 30);
const maxWidthArg = Number(process.argv[4] || 1280);

const inputPath = path.resolve(process.cwd(), inputArg);
if (!fs.existsSync(inputPath)) {
  console.error(`Input video not found: ${inputPath}`);
  process.exit(1);
}

const ffmpegCheck = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
if (ffmpegCheck.status !== 0) {
  console.error("ffmpeg is not installed. Install ffmpeg, then run npm run video:compress");
  process.exit(1);
}

const parsed = path.parse(inputPath);
const outPath = path.join(parsed.dir, `${parsed.name}.optimized${parsed.ext}`);

const args = [
  "-y",
  "-i",
  inputPath,
  "-vf",
  `scale='min(${maxWidthArg},iw)':-2`,
  "-c:v",
  "libx264",
  "-preset",
  "medium",
  "-crf",
  String(crfArg),
  "-c:a",
  "aac",
  "-b:a",
  "96k",
  "-movflags",
  "+faststart",
  "-pix_fmt",
  "yuv420p",
  outPath,
];

console.log(`Compressing: ${inputPath}`);
const result = spawnSync("ffmpeg", args, { stdio: "inherit" });
if (result.status !== 0 || !fs.existsSync(outPath)) {
  console.error("Compression failed.");
  process.exit(1);
}

const oldSize = fs.statSync(inputPath).size;
const newSize = fs.statSync(outPath).size;

if (newSize < oldSize) {
  fs.renameSync(outPath, inputPath);
  const savedMb = ((oldSize - newSize) / (1024 * 1024)).toFixed(2);
  console.log(`Done. Replaced hero video. Saved ${savedMb} MB.`);
} else {
  fs.unlinkSync(outPath);
  console.log("No replacement made: optimized file was not smaller.");
}
