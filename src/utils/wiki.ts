export interface WikiSummary {
  title: string;
  description?: string;
  extract?: string;
  thumbnailUrl?: string;
  pageUrl?: string;
}

function encodeTitle(title: string) {
  return encodeURIComponent(title.trim());
}

export async function fetchWikipediaSummary(title: string): Promise<WikiSummary | null> {
  const encodedTitle = encodeTitle(title);
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodedTitle}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as Record<string, any>;
    if (!data || typeof data !== "object") {
      return null;
    }

    return {
      title: data.title,
      description: typeof data.description === "string" ? data.description : undefined,
      extract: typeof data.extract === "string" ? data.extract : undefined,
      thumbnailUrl:
        typeof data.thumbnail?.source === "string"
          ? data.thumbnail.source
          : typeof data.originalimage?.source === "string"
          ? data.originalimage.source
          : undefined,
      pageUrl:
        typeof data.content_urls?.desktop?.page === "string"
          ? data.content_urls.desktop.page
          : `https://en.wikipedia.org/wiki/${encodedTitle}`,
    };
  } catch {
    return null;
  }
}
