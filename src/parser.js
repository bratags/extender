(async function (parser) {
  parser.loadCache = async (options) => {
    const { shop } = options;
    let cached = cache.lru.get(shop);

    if (cached === undefined) {
      cached = { hits: 0 };
      cache.lru.set(shop, cached);
      // request urls that we already have for this shop from backend /v1/shop/knix.com
      const response = await fetch(
        `https://${API_SERVER}/v1/shop/${shop}`,
        { mode: "cors" }
      );
      const urls = await response.json();
      cached.data = urls;
      cache.lru.set(shop, cached);
    } else {
      cached.hits += 1;
      cache.lru.set(shop, cached);
    }
  };
  parser.parsePage = (tabId, shop) => {
    return chrome.scripting
      .executeScript({
        target: { tabId },
        files: [`src/parsers/${shop}.js`],
      })
      .then(async (parsed) => {
        return parsed[0]?.result;
      });
  };
})(
  typeof module !== "undefined" && module.exports
    ? module.exports
    : (self.parser = self.parser || {})
);
