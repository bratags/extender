importScripts(
    "../dist/amplitude.umd.min.js",
    "../dist/async.min.js",
    "../dist/uuidv5.min.js",
    "../dist/lru-cache.min.js",
    "./settings.js",
    "./cache.js",
    "./parser.js",
    "./shops.js"
)

amplitude.getInstance().init("0475f970e02a8182591c0491760d680a")

let sessionCookie
const VERSION = "0.0.0"
const INSTALL_URL = "https://bratags.com/extension-installed"
const API_SERVER =
    settings.ENV === "production" ? "api.bratags.com" : "api.dev.bratags.com"

let state = {
    route: {
        path: "main",
    },
    unknowns: {},
}
function requestHandler(details) {
    const origin = details.url.match(shops.reALL)?.[0]
    const shop = origin?.split('.')?.[0]
    const isTabRelated = details.tabId !== -1
    const isMainFrame = details.frameId === 0

    if (shop && isTabRelated && isMainFrame) {
        // send a request to the backend to begin filling the local cache for all bras available
        parser.loadCache({
            shop,
        })
    }
}
async function getTagById(id) {
    const response = await fetch(`https://${API_SERVER}/v1/tag/${id}`, {
        mode: "cors",
        credentials: "include",
        headers: {
            'Cookie': `session.sid=${sessionCookie}`
        },
    })
    if (/401|500/.test(response.status)) {
        console.error(response)
        return
    }
    const tag = await response.json()
    cache.lru.set(id, tag)
    return tag
}
async function getTagsByGTIN(gtin) {
    const cached = cache.lru.get(gtin)

    if (cached) {
        return cached
    }
    const response = await fetch(
        `https://${API_SERVER}/v1/tag/gtin/${gtin}/list`,
        {
            mode: "cors",
            credentials: "include",
            headers: {
                'Cookie': `session.sid=${sessionCookie}`
            },
        }
    )
    if (/401|500/.test(response.status)) {
        console.error(response)
        return
    }
    const tags = await response.json()
    cache.lru.set(gtin, tags)
    return tags
}
async function getTagsByURL(url, ignoreShop = false) {
    const urlId = uuidv5(url, uuidv5.URL)
    const cached = cache.lru.get(urlId)

    if (cached) {
        return cached
    }
    const origin = url.match(shops.reALL)?.[0]
    const shop = origin?.split('.')?.[0]
    if (!shop && !ignoreShop) {
        console.error("no shop found for url: ", url)
        return
    }
    const response = await fetch(`https://${API_SERVER}/v1/tag/url/list`, {
        mode: "cors",
        credentials: "include",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'Cookie': `session.sid=${sessionCookie}`
        },
        body: JSON.stringify({ url }),
    })
    if (!/200/.test(response.status)) {
        console.error(response)
        return
    }
    const tags = await response.json()
    if (tags?.length) {
        cache.lru.set(urlId, tags)
    }
    if (!tags.length) {
        if (shops.rePrivacyFilter(shop).test(url)) {
            sendMessage({ private: { url } })
            return
        }
        return
    }
    return tags
}
function sameTagExists(tags, bra) {
    return (
        tags?.length &&
        tags.find(
            (tag) =>
                tag.item.band == bra.band &&
                tag.item.cup.toUpperCase() === bra.cup.toUpperCase()
        )
    )
}
async function updateSources() {
    try {
        const response = await fetch(`https://${API_SERVER}/v1/grow/sources`, {
            mode: "cors",
            credentials: "include",
            headers: {
                'Cookie': `session.sid=${sessionCookie}`
            }
        })
        if (response.ok) {
            const sources = await response.json()
            await cache.lru.set("sources", sources)
            return sources
        }
    } catch (error) {
        console.error(error)
    }
}
async function supportedSource(url) {
    const sources = cache.lru.get("sources")?.length ? cache.lru.get("sources") : (await updateSources())
    return sources.find((item) =>
        item.urls.find((itemUrl) =>
            url.toLowerCase().includes(itemUrl.toLowerCase())
        )
    )
}
async function popupHandler() {
    let tags

    const [tab] = await chrome.tabs.query({
        highlighted: true,
        currentWindow: true
    })
    if (!tab) {
        return
    }
    // check the sources before anything
    if (!(await supportedSource(tab.url))) {
        sendMessage({ unknown: { url: tab.url } })
        return
    }
    const origin = tab.url.match(shops.reALL)?.[0]
    const shop = origin?.split('.')?.[0]
    if (!shop) {
        tags = await getTagsByURL(tab.url, true)
        if (!tags?.length) {
            sendMessage({ unknown: { url: tab.url, validSource: true } })
            return
        }
        sendMessage({ tags })
        return
    }
    const bra = (await parser.parsePage(tab.id, shop)) || {
        shop,
        url: tab.url,
    }
    const gtin = bra.gtin
    tags = cache.lru.get(gtin) || (await getTagsByGTIN(gtin))

    // console.log(shop, JSON.stringify(bra), tags, tab);
    if (sameTagExists(tags, bra)) {
        // if we have the tag then show it
        sendMessage({ tags, bra })
        return
    } else if (cache.lru.has(shop)) {
        // else request it from the backend
        tags = await getTagsByURL(tab.url)
        sendMessage({ bra: { ...bra, tags } })
        return
    }
    sendMessage({ unknown: bra })
}
async function getSessionCookie() {
    let cookie,
        retries = 0

    while (!cookie && retries < 3) {
        cookie = await getCookieFromStore()
        if (!cookie) {
            await fetch(`https://${API_SERVER}/v1/grow/diversity`, {
                mode: "cors",
                credentials: "include",
            })
        }
        retries += 1
    }
    sessionCookie = cookie
    // console.log('sessionCookie: ', sessionCookie)
    return {
        sessionCookie
    }
}
async function getCookieFromStore(name = 'connect.sid') {
    const window = await chrome.windows.getCurrent()
    const tabs = await chrome.tabs.query({ windowId: window.id })
    const stores = await chrome.cookies.getAllCookieStores()

    const store = stores.find(store => store.tabIds.find(tabId => tabs.find(tab => tab.id === tabId)))
    const cookies = await chrome.cookies.getAll({
        name,
        url: `https://${API_SERVER}`,
        storeId: store.id
    })
    const cookie = cookies.find(cookie => settings.ENV === "production" ? !cookie.domain.match(/dev/) : cookie.domain.match(/dev/))
    return cookie?.value
        ? decodeURIComponent(cookie.value)
        : undefined
}
// This function can't be async... should according to the docs but ran into issues! Worked fine on the Vue side, but not in the popup window.
function messageHandler(request, sender, reply) {
    switch (request.command) {
        case "getNewTag":
            getTagById(request.id).then((tag) => {
                sendMessage({ tags: [tag], isNew: true })
            })
        case "sw":
            popupHandler()
            Promise.all([
                getSessionCookie(),
                new Promise((resolve) =>
                    settings
                        .get()
                        .then((settings) =>
                            resolve({ settings: { ...settings, API_SERVER } })
                        )
                ),
                new Promise((resolve) =>
                    resolve({
                        i18n: { locale: chrome.i18n.getMessage("@@ui_locale") },
                    })
                ),
            ]).then((p) =>
                reply(p.reduce((config, cur) => ({ ...config, ...cur }), {}))
            )
            break
        case "cookie":
            getCookieFromStore(request.name).then((cookie) => reply(cookie))
            break
        case "tag":
            const urlId = uuidv5(request.url, uuidv5.URL)

            cache.lru.delete(urlId)
            cache.lru.delete(request.gtin)
            break
        case "getRoute":
            chrome.storage.session
                .get("route")
                .then((response) => reply(response?.route))
            break
        case "commit":
            const { store, obj, key, keys, value, values } = request

            if (obj === "settings") {
                let update = { [key]: value }
                settings.update(update).then(() => reply(update))
            } else if (obj.match(/route/)) {
                state[obj][key] = value
                chrome.storage[store]
                    .set({ [obj]: state[obj] })
                    .then(() => reply(state[obj]))
            }
            break
        case "signout":
            chrome.storage.local
                .remove(["apikey", "token", "user"])
                .then(() => reply())
            break
        case "auth":
            const { user, token, apikey } = request.credentials

            if (user !== state.user) {
                chrome.storage.local
                    .set({ user })
                    .then(() => (state.user = user))
            }
            if (token !== state.token) {
                chrome.storage.local
                    .set({ token })
                    .then(() => (state.token = token))
            }
            if (apikey !== state.apikey) {
                chrome.storage.local.set({ apikey }).then(() => {
                    state.apikey = apikey
                    reply()
                })
            }
            break
        case "unknown":
            const { url, id } = request
            const urlHash = uuidv5(url, uuidv5.URL)
            const unknowns = {
                ...state.unknowns,
                [urlHash]: id,
            }
            chrome.storage.local.set({ unknowns }).then(() => {
                state.unknowns = unknowns
                reply()
            })
    }
    return true
}
async function sendMessage(message) {
    let port = cache.lru.get("messagePort")

    while (!port) {
        await new Promise((resolve) => setTimeout(resolve, 50))
        port = cache.lru.get("messagePort")
    }

    try {
        if (message.unknown || message.private) {
            amplitude.getInstance().logEvent("Program Event", {
                action: "sendMessage",
                details: message,
            })
        }
        port.postMessage(message)
        cache.lru.get("externalMessagePort").postMessage(message)
    } catch (error) {
        if (error.message.match(/disconnected port/)) {
            cache.lru.delete("messagePort")
        }
    }
}
chrome.webRequest.onBeforeRequest.addListener(requestHandler, {
    urls: ["<all_urls>"],
})
chrome.commands.onCommand.addListener((command) => {
    if (command === "open-popup") {
        if (chrome.action.openPopup)
            chrome.action.openPopup(() => {
                // bug https://github.com/GoogleChrome/developer.chrome.com/issues/2602;
                amplitude.getInstance().logEvent("Program Event", {
                    action: "Opened Popup",
                    details: "popupHandler",
                })
            })
    }
})
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        chrome.tabs.create({ url: INSTALL_URL })
    }
})
chrome.runtime.onConnect.addListener((port) => {
    cache.lru.set("messagePort", port)
})
chrome.runtime.onConnectExternal.addListener((port) => {
    cache.lru.set("externalMessagePort", port)
})
chrome.runtime.onMessage.addListener(messageHandler)
chrome.runtime.onMessageExternal.addListener(messageHandler)
