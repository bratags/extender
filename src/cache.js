(async function (cache) {
    cache.lru = new LRUCache.LRUCache({ max: 500, ttl: 60000 * 5 });
})(typeof module !== 'undefined' && module.exports ? module.exports : (self.cache = self.cache || {}));