import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, "..", "demo-import.csv");

const phrases = [
  "岁岁年年，万喜万般宜。",
  "前路明朗，所遇皆甜。",
  "心有山海，静而无边。",
  "平安喜乐，万事胜意。",
  "星光不负赶路人。",
  "今日份快乐已签收。",
  "保持热爱，奔赴山海。",
  "温柔且坚定，知足且上进。",
  "愿你我皆好在春夏秋冬。",
  "新的一岁，继续闪闪发亮。",
  "把日子过成喜欢的样子。",
  "小满胜万全。",
  "风有约，花不误。",
  "日日是好日。",
  "万事顺遂，不止生日。",
  "愿你眼里有光，心中有爱。",
  "所求皆如愿，所行皆坦途。",
  "与世界兴致盎然地交手。",
  "要开心，要早睡，要爱自己。",
  "这一格，是给你的留白与惊喜。",
];

const AUDIO = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
const VIDEO = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
/** 与主站 40×25 格一致，演示用满格 1000 条（每行均有文案 + 主图） */
const ROWS = 1000;

function escField(s) {
  const t = String(s);
  if (/[",\n\r]/.test(t)) return `"${t.replace(/"/g, '""')}"`;
  return t;
}

/** 与运营约定一致：编号 + 文案 + 本地 content 路径；缺图时页面会显示占位图 */
const lines = ["\uFEFF编号,文案,图片url,音频url,视频url"];

for (let i = 1; i <= ROWS; i++) {
  const id = String(i).padStart(4, "0");
  const text = `${phrases[(i - 1) % phrases.length]}（演示格 ${id}）`;
  const img = `./content/${id}.jpg`;
  let a = "";
  let v = "";
  if (i === 2) a = AUDIO;
  else if (i === 3) v = VIDEO;
  else if (i === 4) {
    a = AUDIO;
    v = VIDEO;
  } else if (i % 23 === 5) a = AUDIO;
  else if (i % 29 === 7) v = VIDEO;
  lines.push([escField(id), escField(text), img, a, v].join(","));
}

fs.writeFileSync(outPath, lines.join("\n"), "utf8");
console.log("Wrote", outPath, "rows:", ROWS);
