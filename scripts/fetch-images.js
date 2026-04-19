import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const imagesDir = path.join(projectRoot, "public", "images");
const dataPath = path.join(projectRoot, "src", "data.ts");

const wikipediaSummaryUrl = (title) =>
  `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;

const wikipediaPageImageUrl = (title) =>
  `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&pithumbsize=1600&format=json&formatversion=2`;

const wikipediaSearchUrl = (title) =>
  `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(title)}&srlimit=5&format=json&formatversion=2`;

const wikipediaImagesUrl = (title) =>
  `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=images&imlimit=10&format=json&formatversion=2`;

const wikipediaImageInfoUrl = (fileTitle) =>
  `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url&format=json&formatversion=2`;

const unsplashUrl = (query) =>
  `https://source.unsplash.com/1600x900/?${encodeURIComponent(query)}`;

function categoryHint(id) {
  if (id.startsWith("mu")) return "album";
  if (id.startsWith("m")) return "movie";
  if (id.startsWith("t")) return "TV series";
  if (id.startsWith("b")) return "book";
  if (id.startsWith("g")) return "video game";
  return "media";
}

function imageFileTitleCandidates(images = []) {
  return images
    .map((image) => image.title)
    .filter((title) => /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(title));
}

function slugifyTitle(title) {
  return title
    .toLowerCase()
    .replace(/[—–]/g, " ")
    .replace(/\s*—.*$/, "")
    .replace(/["'’“”]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function getImageFileName(title, id) {
  return `${slugifyTitle(title)}-${id}.jpg`;
}

async function exists(pathname) {
  try {
    await access(pathname);
    return true;
  } catch {
    return false;
  }
}

function normalizeQuery(title) {
  return title
    .replace(/[—–]/g, " ")
    .replace(/\s*—.*$/, "")
    .replace(/["'’“”]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "cult-artwork-fetcher/1.0 (https://github.com)"
    }
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  return res.json();
}

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "cult-artwork-fetcher/1.0 (https://github.com)"
    }
  });
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: ${res.status}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function fetchWikipediaSummaryImage(title) {
  const summaryUrl = wikipediaSummaryUrl(title);
  const json = await fetchJson(summaryUrl);
  if (json.thumbnail?.source) {
    return json.thumbnail.source;
  }
  if (json.originalimage?.source) {
    return json.originalimage.source;
  }
  return null;
}

async function fetchWikipediaImageFromImages(title) {
  const imagesJson = await fetchJson(wikipediaImagesUrl(title));
  const imageTitles = imageFileTitleCandidates(imagesJson?.query?.pages?.[0]?.images || []);
  for (const fileTitle of imageTitles) {
    try {
      const infoJson = await fetchJson(wikipediaImageInfoUrl(fileTitle));
      const imageUrl = infoJson?.query?.pages?.[0]?.imageinfo?.[0]?.url;
      if (imageUrl) {
        return imageUrl;
      }
    } catch {
      // continue to next image
    }
  }
  return null;
}

async function fetchWikipediaImage(title, itemId) {
  const pageTitle = normalizeQuery(title);
  const hint = categoryHint(itemId);
  const candidateTitles = [pageTitle, `${pageTitle} ${hint}`, `${pageTitle} ${hint} poster`].filter(Boolean);

  for (const candidate of candidateTitles) {
    try {
      const summaryImage = await fetchWikipediaSummaryImage(candidate);
      if (summaryImage) {
        return summaryImage;
      }
    } catch {
      // ignored
    }
    try {
      const pageJson = await fetchJson(wikipediaPageImageUrl(candidate));
      const thumbnail = pageJson?.query?.pages?.[0]?.thumbnail?.source;
      if (thumbnail) {
        return thumbnail;
      }
    } catch {
      // ignored
    }
    try {
      const imageFromImages = await fetchWikipediaImageFromImages(candidate);
      if (imageFromImages) {
        return imageFromImages;
      }
    } catch {
      // ignored
    }
  }

  const searchQueries = [pageTitle, `${pageTitle} ${hint}`];
  for (const query of searchQueries) {
    const searchJson = await fetchJson(wikipediaSearchUrl(query));
    const results = searchJson?.query?.search ?? [];
    for (const result of results.slice(0, 5)) {
      try {
        const summaryImage = await fetchWikipediaSummaryImage(result.title);
        if (summaryImage) {
          return summaryImage;
        }
      } catch {
        // ignored
      }
      try {
        const pageJson = await fetchJson(wikipediaPageImageUrl(result.title));
        const thumbnail = pageJson?.query?.pages?.[0]?.thumbnail?.source;
        if (thumbnail) {
          return thumbnail;
        }
      } catch {
        // ignored
      }
      try {
        const imageFromImages = await fetchWikipediaImageFromImages(result.title);
        if (imageFromImages) {
          return imageFromImages;
        }
      } catch {
        // ignored
      }
    }
  }

  throw new Error(`No Wikipedia image found for ${pageTitle}`);
}

async function fetchUnsplashImage(query) {
  const url = unsplashUrl(query);
  try {
    return await fetchBuffer(url);
  } catch (initialError) {
    const fallbackQuery = query.split(" ").slice(0, 4).join(" ");
    if (fallbackQuery !== query) {
      const fallbackUrl = unsplashUrl(fallbackQuery);
      try {
        return await fetchBuffer(fallbackUrl);
      } catch {
        throw initialError;
      }
    }
    throw initialError;
  }
}

async function writeImage(fileName, buffer) {
  const filePath = path.join(imagesDir, fileName);
  await writeFile(filePath, buffer);
  console.log(`Wrote ${filePath}`);
}

async function downloadImage(id, title) {
  const fileName = getImageFileName(title, id);
  const targetFile = path.join(imagesDir, fileName);
  const force = process.argv.includes("--force");
  if (!force && (await exists(targetFile))) {
    console.log(`Skipping ${id} (exists at ${fileName})`);
    return;
  }

  const query = normalizeQuery(title);

  try {
    console.log(`Trying Wikipedia image for ${id}: ${title}`);
    const imageUrl = await fetchWikipediaImage(title, id);
    const buffer = await fetchBuffer(imageUrl);
    await writeImage(fileName, buffer);
    return;
  } catch (error) {
    console.warn(`Wikipedia fallback failed for ${id}: ${error.message}`);
  }

  try {
    console.log(`Trying Unsplash image for ${id}: ${query}`);
    const buffer = await fetchUnsplashImage(query);
    await writeImage(fileName, buffer);
  } catch (error) {
    console.error(`Unsplash fallback failed for ${id}: ${error.message}`);
    console.warn(`Skipping ${id} after all fallbacks failed.`);
  }
}

async function main() {
  await mkdir(imagesDir, { recursive: true });
  const fileText = await readFile(dataPath, "utf8");
  const itemRegex = /\{[^{}]*?id:\s*"([^"]+)"[^{}]*?title:\s*"([^"]+)"/gs;
  const items = [];
  let match;
  while ((match = itemRegex.exec(fileText))) {
    items.push({ id: match[1], title: match[2] });
  }

  if (!items.length) {
    throw new Error("No items found in data.ts");
  }

  for (const item of items) {
    try {
      await downloadImage(item.id, item.title);
    } catch (error) {
      console.error(`Failed to download image for ${item.id}: ${error.message}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
