/**
 * content/{四位编号}.扩展名 —— 浏览器与 Node 脚本共用的约定。
 * 修改扩展名列表时请同步更新根目录 app.js 中同名常量。
 */
export const CONTENT_MEDIA_DIR = "./content";

/** 配图：按尝试顺序（隐式路径默认用第一项） */
export const CONTENT_IMAGE_EXTS = ["jpg", "jpeg", "png", "webp", "gif", "bmp", "svg"];

/** 音频：常见网页可播放格式 */
export const CONTENT_AUDIO_EXTS = ["mp3", "m4a", "aac", "wav", "ogg", "opus", "flac"];

/** 视频：常见网页可播放格式 */
export const CONTENT_VIDEO_EXTS = ["mp4", "webm", "ogv", "mov", "m4v"];

export function contentUrlFor(id, ext) {
  return `${CONTENT_MEDIA_DIR}/${id}.${ext}`;
}

/** 在磁盘已有扩展名中按优先级选一个；没有则返回列表首项（作为默认写入 JSON 的占位） */
export function pickExtFromDisk(preferredOrder, diskExts) {
  const set = new Set(diskExts.map((e) => String(e).toLowerCase()));
  for (const e of preferredOrder) {
    if (set.has(String(e).toLowerCase())) return e;
  }
  return preferredOrder[0];
}
