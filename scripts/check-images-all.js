import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const dataFile = path.join(process.cwd(), 'public', 'data.json');
const dataText = readFileSync(dataFile, 'utf8');
const dataJson = JSON.parse(dataText);

const imageDirs = {
  books: new Set(readdirSync(path.join(process.cwd(), 'public', 'images', 'books'))),
  games: new Set(readdirSync(path.join(process.cwd(), 'public', 'images', 'games'))),
  movies: new Set(readdirSync(path.join(process.cwd(), 'public', 'images', 'movies'))),
  music: new Set(readdirSync(path.join(process.cwd(), 'public', 'images', 'music'))),
  tv: new Set(readdirSync(path.join(process.cwd(), 'public', 'images', 'tv'))),
};

function slugifyTitle(title) {
  return title
    .toLowerCase()
    .replace(/[—–]/g, ' ')
    .replace(/\s*—.*$/, '')
    .replace(/["'’“”]/g, '')
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

const missing = [];

for (const categoryItems of Object.values(dataJson.data ?? {})) {
  if (!Array.isArray(categoryItems)) continue;
  for (const item of categoryItems) {
    if (!item?.id || !item?.title) continue;
    const slug = slugifyTitle(item.title);
    const category = getCategoryFromId(item.id);
    const expectedBase = `${slug}-${item.id}`;
    const exists = imageDirs[category].has(`${expectedBase}.jpg`) || imageDirs[category].has(`${expectedBase}.png`);
    if (!exists) {
      missing.push({ id: item.id, title: item.title, category, expectedBase });
    }
  }
}

if (missing.length === 0) {
  console.log('All expected artwork files are present.');
} else {
  console.log(`Missing ${missing.length} artwork files:`);
  for (const entry of missing) {
    console.log(`${entry.id} ${entry.category} ${entry.title} -> ${entry.expectedBase}.jpg|.png`);
  }
}
