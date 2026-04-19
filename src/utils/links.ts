import type { Category } from "../data";

type ExternalIconKey = "imdb" | "rotten" | "wikipedia" | "goodreads" | "spotify";

function encodeTitle(title: string) {
  return encodeURIComponent(title.trim());
}

function wikiSearchUrl(title: string) {
  return `https://en.wikipedia.org/wiki/Special:Search?search=${encodeTitle(title)}`;
}

export function getExternalLinks(category: Category, title: string) {
  const query = encodeTitle(title);

  switch (category) {
    case "movies":
    case "tv":
      return [
        { icon: "imdb" as ExternalIconKey, label: "IMDb", href: `https://www.imdb.com/find?q=${query}` },
        {
          icon: "rotten" as ExternalIconKey,
          label: "Rotten Tomatoes",
          href: `https://www.rottentomatoes.com/search?search=${query}`,
        },
        { icon: "wikipedia" as ExternalIconKey, label: "Wikipedia", href: wikiSearchUrl(title) },
      ];
    case "books":
      return [
        { icon: "goodreads" as ExternalIconKey, label: "Goodreads", href: `https://www.goodreads.com/search?q=${query}` },
        { icon: "wikipedia" as ExternalIconKey, label: "Wikipedia", href: wikiSearchUrl(title) },
      ];
    case "games":
      return [{ icon: "wikipedia" as ExternalIconKey, label: "Wikipedia", href: wikiSearchUrl(title) }];
    case "music":
      return [
        { icon: "spotify" as ExternalIconKey, label: "Spotify", href: `https://open.spotify.com/search/${query}` },
        { icon: "wikipedia" as ExternalIconKey, label: "Wikipedia", href: wikiSearchUrl(title) },
      ];
    default:
      return [];
  }
}
