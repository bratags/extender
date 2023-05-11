/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

import "./main.scss";
import "./main.css";

// Components
import App from "./App.vue";

// Composables
import { createApp, ref, reactive } from "vue";

// Plugins
import { registerPlugins } from "@/plugins";

// 3rd Party
import VueSocialSharing from "vue-social-sharing";
import { createAuth0 } from "@auth0/auth0-vue";
import amplitude from "amplitude-js";

const {
    VITE_AUTH0_DOMAIN,
    VITE_AUTH0_CLIENTID,
    VITE_AUTH0_AUDIENCE,
    VITE_EXTENSION_ID,
    VITE_AMPLITUDE_ID,
    MODE
} = import.meta.env;

if (MODE === 'production') {
    amplitude.getInstance().init(VITE_AMPLITUDE_ID);
}

const id = chrome?.runtime?.id || VITE_EXTENSION_ID;
const port = chrome.runtime.connect(id);
const app = createApp(App);
const $auth = createAuth0({
    domain: VITE_AUTH0_DOMAIN,
    client_id: VITE_AUTH0_CLIENTID,
    audience: VITE_AUTH0_AUDIENCE,
});

app.use($auth);
app.use(VueSocialSharing);

let settings = ref({});
let workerPort = ref({});
let message = ref({});

port.onMessage.addListener((request) => {
    message.value = request;
});
workerPort.value = port;

async function updateSetting(name, value) {
    // send update via messages
    chrome.runtime.sendMessage(
        id,
        {
            command: "commit",
            store: "local", // chrome storage type (i.e. local, session, sync)
            obj: "settings",
            key: name,
            value:
                typeof value === "string" && value.match(/true|false/i)
                    ? !!value
                    : value,
        },
        (response) => {
            settings.value = { ...settings.value, ...response };
        }
    );
}
async function copy(text, tooltipId = text) {
    if (this.debounce.value) return;
    this.debounce.value = true;
    this.tooltips[tooltipId] = true;
    try {
        await navigator.clipboard.writeText(text);
    } catch (error) {
        console.error(error);
        this.debounce.value = false;
        this.tooltips[tooltipId] = false;
    }
    setTimeout(() => {
        this.debounce.value = false;
    }, 100);
    setTimeout(() => {
        this.tooltips[tooltipId] = false;
    }, 1500);
}
app.provide("clipboard", {
    copy,
    debounce: ref(false),
    tooltips: reactive({}),
});
(async function initFromSW() {
    const sw = await new Promise((resolve) =>
        chrome.runtime.sendMessage(id, { command: "sw" }, (response) =>
            resolve(response)
        )
    )
    settings.value = sw.settings;
    let messages;
    if (!chrome?.i18n) {
        messages = await import(/* @vite-ignore */`../../_locales/${sw.i18n.locale}/messages.json`);
    }
    const i18n = {
        ...sw.i18n,
        getMessage: chrome.i18n?.getMessage || function (key) { return messages[key].message }
    }
    app.provide("i18n", i18n);
    app.provide("sessionId", sw.sessionId);
    completeSetup()
})();
async function completeSetup() {
    app.provide("settings", settings);
    app.provide("updateSetting", updateSetting);
    app.provide("message", message);
    app.provide("extensionId", id);

    registerPlugins(app);

    app.mount("#app");
}
