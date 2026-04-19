const titles = [
  "The Princess Bride",
  "Willy Wonka & the Chocolate Factory",
  "Repo Man",
  "Twin Peaks",
  "Legion",
  "The Velvet Underground & Nico",
  "OK Computer — Radiohead",
  "In the Aeroplane Over the Sea — Neutral Milk Hotel",
  "The Downward Spiral — Nine Inch Nails",
  "The Rise and Fall of Ziggy Stardust — David Bowie",
  "Blue — Joni Mitchell"
];
const normalizeQuery = (title) => title.replace(/[—–]/g, " ").replace(/\s*—.*$/, "").replace(/['"’“”]/g, "").replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
const summaryUrl = (title) => `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
const searchUrl = (title) => `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(title)}&srlimit=5&format=json&formatversion=2`;
const pageImageUrl = (title) => `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&pithumbsize=1600&format=json&formatversion=2`;
(async () => {
  for (const title of titles) {
    const pageTitle = normalizeQuery(title);
    console.log('TITLE', title, '=>', pageTitle);
    try {
      const summary = await fetch(summaryUrl(pageTitle), { headers: { 'User-Agent': 'cult-artwork-fetcher/1.0' } });
      console.log('summary status', summary.status);
      console.log(await summary.json());
    } catch (e) {
      console.error('summary failed', e.message);
    }
    try {
      const search = await fetch(searchUrl(pageTitle), { headers: { 'User-Agent': 'cult-artwork-fetcher/1.0' } });
      const searchJson = await search.json();
      console.log('search', JSON.stringify(searchJson.query.search.slice(0, 3), null, 2));
      if (searchJson.query.search?.[0]?.title) {
        const page = await fetch(pageImageUrl(searchJson.query.search[0].title), { headers: { 'User-Agent': 'cult-artwork-fetcher/1.0' } });
        console.log('page image status', page.status);
        console.log(JSON.stringify(await page.json(), null, 2));
      }
    } catch (e) {
      console.error('search failed', e.message);
    }
    console.log('---');
  }
})();
