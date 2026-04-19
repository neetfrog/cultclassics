import { readFile, access, readdir } from 'node:fs/promises';
import path from 'node:path';

const dataDir = path.join(process.cwd(), 'src', 'data');
const files = await readdir(dataDir);
const dataFiles = files.filter((file) => file.endsWith('.ts'));
const itemRegex = /\{[^{}]*?id:\s*"([^\"]+)"[^{}]*?title:\s*"([^\"]+)"/gs;
const items = [];
let match;
const slugifyTitle = (title) =>
  title
    .toLowerCase()
    .replace(/[—–]/g, ' ')
    .replace(/\s*—.*$/, '')
    .replace(/["'’“”]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');

for (const file of dataFiles) {
  const fileText = await readFile(path.join(dataDir, file), 'utf8');
  itemRegex.lastIndex = 0;
  while ((match = itemRegex.exec(fileText))) {
    items.push({ id: match[1], title: match[2] });
  }
}

function getCategoryFromId(id) {
  if (id.startsWith('mu')) return 'music';
  if (id.startsWith('m')) return 'movies';
  if (id.startsWith('t')) return 'tv';
  if (id.startsWith('b')) return 'books';
  if (id.startsWith('g')) return 'games';
  return 'movies';
}

const missing = [];
for (const item of items) {
  const fileName = `${slugifyTitle(item.title)}-${item.id}.jpg`;
  const category = getCategoryFromId(item.id);
  const filePath = path.join(process.cwd(), 'public', 'images', category, fileName);
  try {
    await access(filePath);
  } catch {
    missing.push({ ...item, fileName });
  }
}

if (missing.length === 0) {
  console.log('OK: No missing images.');
} else {
  console.log(`Missing ${missing.length} images:`);
  missing.forEach((m) => console.log(`${m.id} ${m.title} -> ${m.fileName}`));
}
