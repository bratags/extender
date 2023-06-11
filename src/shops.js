(async function (shops) {
    const API_SERVER = settings.ENV === "production" ? "api.bratags.com" : "api.dev.bratags.com"
    shops.reALL = await createRegexFromURLs()

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special characters
    }
    async function createRegexFromURLs() {
        const urls = await getShopURLS()
        const escapedURLs = urls.map((url) => escapeRegExp(url))
        const regexPattern = escapedURLs.join('|')
        return new RegExp(regexPattern)
    }

    const re = {
        amazon: new RegExp(/amazon.com\/gp\/your-account/)
    }

    shops.rePrivacyFilter = (shop) => {
        return re[shop] || new RegExp(/$^/)
    }

    async function getShopURLS() {
        const cached = cache.lru.get('urls')

        if (cached) {
            return cached
        }
        const response = await fetch(
            `https://${API_SERVER}/v1/grow/sources?filter=urls`,
            {
                mode: "cors",
                credentials: "include",
            }
        )
        if (/401|500/.test(response.status)) {
            console.error(response)
            return
        }
        const urls = await response.json()
        cache.lru.set('urls', urls)
        return urls
    }
})(
    typeof module !== "undefined" && module.exports
        ? module.exports
        : (self.shops = self.shops || {})
)
