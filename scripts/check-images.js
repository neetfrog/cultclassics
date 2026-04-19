import { readFile, access } from 'node:fs/promises';
import path from 'node:path';

const dataPath = path.join(process.cwd(), 'src', 'data.ts');
const fileText = await readFile(dataPath, 'utf8');
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

while ((match = itemRegex.exec(fileText))) {
  items.push({ id: match[1], title: match[2] });
}

const missing = [];
for (const item of items) {
  const fileName = `${slugifyTitle(item.title)}-${item.id}.jpg`;
  const filePath = path.join(process.cwd(), 'public', 'images', fileName);
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
