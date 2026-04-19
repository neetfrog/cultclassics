const title = "The Princess Bride";
const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
(async () => {
  const res = await fetch(url, { headers: { "User-Agent": "cult-artwork-fetcher/1.0" } });
  console.log("status", res.status);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
})();
