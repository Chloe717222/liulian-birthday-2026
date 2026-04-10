/**
 * 将 content/ 下图片规范为 0001.jpg / 0501.png 等形式（与格子 id 一致）。
 * - 仅处理常见图片扩展名；不改动 .mp3/.mp4 等与 CSV、.gitkeep。
 * - 已从「0201 - 副本 (2).jpg」等文件名中解析前导编号；同一编号多文件时保留一份，其余移到 content/_duplicate_backup/。
 * 运行：node scripts/rename-content-images.mjs
 * 演练：node scripts/rename-content-images.mjs --dry-run
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const contentDir = path.join(root, "content");
const backupDir = path.join(contentDir, "_duplicate_backup");

const dryRun = process.argv.includes("--dry-run");
const IMAGE_RE = /\.(jpe?g|png|gif|webp|bmp|svg)$/i;

function extractIdFromImageFilename(filename) {
  const base = path.parse(filename).name;
  if (/^\d{4}$/.test(base)) return base;
  const m4prefix = /^(\d{4})(?=\D|$)/.exec(base);
  if (m4prefix) return m4prefix[1];
  const mShort = /^(\d{1,3})(?=\D|$)/.exec(base);
  if (mShort) {
    const n = Number.parseInt(mShort[1], 10);
    if (!Number.isNaN(n) && n >= 1 && n <= 1000) return String(n).padStart(4, "0");
  }
  const mDot = /^(\d{1,4})\./i.exec(filename);
  if (mDot) {
    const n = Number.parseInt(mDot[1], 10);
    if (!Number.isNaN(n) && n >= 1 && n <= 1000) return String(n).padStart(4, "0");
  }
  return null;
}

function isCanonical(name) {
  return /^\d{4}\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(name);
}

function scoreSource(filename) {
  if (isCanonical(filename)) return 0;
  return filename.length;
}

if (!fs.existsSync(contentDir)) {
  console.error("未找到 content/ 目录");
  process.exit(1);
}

const entries = fs.readdirSync(contentDir, { withFileTypes: true });
const imageFiles = entries
  .filter((d) => d.isFile())
  .map((d) => d.name)
  .filter((name) => name !== ".gitkeep" && !name.endsWith(".csv") && IMAGE_RE.test(name));

const byTarget = new Map();
const skipped = [];

for (const name of imageFiles) {
  const id = extractIdFromImageFilename(name);
  if (!id) {
    skipped.push(name);
    continue;
  }
  const ext = path.extname(name);
  const target = `${id}${ext}`;
  if (!byTarget.has(target)) byTarget.set(target, []);
  byTarget.get(target).push(name);
}

let movedDup = 0;
let renamed = 0;
let noop = 0;

function ensureBackupDir() {
  if (!dryRun && !fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
}

for (const [target, sources] of byTarget) {
  sources.sort((a, b) => scoreSource(a) - scoreSource(b) || a.localeCompare(b, "zh-Hans-CN"));
  const winner = sources[0];
  const dupes = sources.slice(1);

  for (const d of dupes) {
    const from = path.join(contentDir, d);
    const stamp = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const to = path.join(backupDir, `${stamp}_${d.replace(/[/\\]/g, "_")}`);
    ensureBackupDir();
    if (dryRun) {
      console.log(`[dup→backup] ${d} → _duplicate_backup/...`);
    } else {
      fs.renameSync(from, to);
    }
    movedDup += 1;
  }

  if (winner === target) {
    noop += 1;
    continue;
  }

  const fromPath = path.join(contentDir, winner);
  const toPath = path.join(contentDir, target);

  if (winner !== target) {
    if (fs.existsSync(toPath) && winner !== target) {
      const innerDup = path.join(backupDir, `_${Date.now()}_conflict_${winner}`);
      ensureBackupDir();
      if (dryRun) {
        console.log(`[conflict] 目标已存在，先移走: ${winner} → backup`);
      } else {
        fs.renameSync(fromPath, innerDup);
      }
      movedDup += 1;
      continue;
    }
    if (dryRun) {
      console.log(`[rename] ${winner} → ${target}`);
    } else {
      fs.renameSync(fromPath, toPath);
    }
    renamed += 1;
  }
}

if (skipped.length) {
  console.warn(`无法解析编号的图片（已跳过 ${skipped.length} 个）:`);
  for (const s of skipped.slice(0, 15)) console.warn(`  - ${s}`);
  if (skipped.length > 15) console.warn(`  … 另有 ${skipped.length - 15} 个`);
}

console.log(
  dryRun
    ? `[演练] 将重命名 ${renamed} 个，将移走重复 ${movedDup} 个，已是规范名 ${noop} 个`
    : `完成：重命名 ${renamed} 个，重复已移入 _duplicate_backup（${movedDup} 个），规范名未动 ${noop} 个`
);
