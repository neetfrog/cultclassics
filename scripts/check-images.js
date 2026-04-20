import { readFile, access } from 'node:fs/promises';
import { accessSync } from 'node:fs';
import path from 'node:path';

const dataFile = path.join(process.cwd(), 'public', 'data.json');
const dataText = await readFile(dataFile, 'utf8');
const json = JSON.parse(dataText);
const items = [];
for (const categoryItems of Object.values(json.data ?? {})) {
  if (Array.isArray(categoryItems)) {
    for (const item of categoryItems) {
      if (item?.id && item?.title) {
        items.push(item);
      }
    }
  }
}

function slugifyTitle(title) {
  return title
    .toLowerCase()
    .replace(/[—–]/g, ' ')
    .replace(/\s*—.*$/, '')
    .replace(/['"’“”]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

function getCategoryFromId(id) {
  if (id.startsWith('mu')) return 'music';
  if (id.startsWith('m')) return 'movies';
  if (id.startsWith('t')) return 'tv';
  if (id.startsWith('b')) return 'books';
  if (id.startsWith('g')) return 'games';
  return 'movies';
}

const imageExtensions = ['.jpg', '.png'];
const missing = [];
for (const item of items) {
  const slug = slugifyTitle(item.title);
  const category = getCategoryFromId(item.id);
  const hasArtwork = imageExtensions.some((ext) => {
    const fileName = `${slug}-${item.id}${ext}`;
    const filePath = path.join(process.cwd(), 'public', 'images', category, fileName);
    try {
      accessSync(filePath);
      return true;
    } catch {
      return false;
    }
  });

  if (!hasArtwork) {
    missing.push({ id: item.id, title: item.title, category, expected: `${slug}-${item.id}.jpg|.png` });
  }
}

if (missing.length === 0) {
  console.log('OK: No missing images.');
} else {
  console.log(`Missing ${missing.length} images:`);
  missing.forEach((m) => console.log(`${m.id} ${m.title} -> ${m.fileName}`));
}
