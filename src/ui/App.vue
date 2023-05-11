<template>
    <v-app :theme="theme">
        <v-app-bar density="compact" flat>
            <v-btn
                variant="plain"
                icon
                density="compact"
                color="quaternary"
                v-if="route?.path !== 'main'"
                @click="routeHandler('main')"
            >
                <v-icon class="mr-2" icon="close"></v-icon>
            </v-btn>
            <v-spacer></v-spacer>
            <span class="mx-8 text-body-2 font-weight-thin text-quaternary"
                >v{{ version }}</span
            >
            <v-btn
                variant="plain"
                icon
                size="x-small"
                id="theme"
                @click="themeHandler"
            >
                <v-icon color="quaternary" :icon="theme === 'light' ? 'light_mode' : 'dark_mode'"></v-icon>
            </v-btn>
            <v-avatar v-if="isAuthenticated" size="x-small">
                <v-img :src="user?.picture" :alt="user?.name"></v-img>
            </v-avatar>
            <v-btn
                variant="plain"
                icon
                density="compact"
                color="quaternary"
                @click="login"
                :loading="loading.login"
            >
                <span class="material-icons">{{
                    isAuthenticated ? "logout" : "login"
                }}</span>
            </v-btn>
            <v-btn
                variant="plain"
                icon
                density="compact"
                color="quaternary"
                @click="
                    routeHandler(
                        route?.path === 'settings' ? 'main' : 'settings'
                    )
                "
                class="mr-6"
            >
                <span class="material-icons">settings</span>
            </v-btn>
        </v-app-bar>
        <v-main class="pb-0">
            <suspense>
                <b-main v-if="route?.path === 'main'" :message="message"></b-main>
            </suspense>
            <suspense>
                <b-settings v-if="route?.path === 'settings'"></b-settings>
            </suspense>
        </v-main>
        <div class="mb-16 ml-8">
            <div class="mb-2 text-caption"><span class="font-weight-bold text-uppercase">sid: </span>{{ sessionId }}</div>
        </div>
        <v-footer
            :color="theme === 'light' ? 'grey-lighten-4' : undefined"
            app
            class="pa-4 d-flex align-center"
        >
            <a
                id="site-href"
                target="_blank"
                rel="noopener"
                style="text-decoration: none"
                href="https://bratags.com"
            >
                <div class="text-h6 text-quaternary ml-2">
                    <span style="font-family: sans-serif; font-size: smaller"
                        >©</span
                    >
                    2023 Bratags
                </div>
            </a>
            <v-spacer></v-spacer>
            <div class="mr-4">
                <share-menu color="quaternary">
                    <span class="material-icons mr-2">share</span>share
                </share-menu>
            </div>
        </v-footer>
    </v-app>
</template>
<style scoped>
:deep() .small-switch .v-switch__track {
    height: 20px;
    width: 40px;
}
:deep() .small-switch .v-switch__thumb {
    height: 16px;
    width: 16px;
}
</style>
<style>
.small-icon {
    font-size: 16px;
}
.username {
    font-style: italic;
    font-size: smaller;
    -webkit-text-stroke-width: thin;
}
</style>
<script setup>
import { version } from "../../package.json";
import { ref, inject, reactive, watch, computed, provide } from "vue";
import { useAuth0 } from "@auth0/auth0-vue";
import { useAsyncState } from "@vueuse/core";

import ShareMenu from "./components/ShareMenu.vue";
import BMain from "./components/BMain.vue";
import BSettings from "./components/BSettings.vue";

const message = inject("message");
const sessionId = inject('sessionId');
const extensionId = inject("extensionId");
const settings = inject("settings");
const updateSetting = inject("updateSetting");
const theme = ref(settings.value.theme || "light");
const {
    user,
    isAuthenticated,
    loginWithPopup,
    getAccessTokenSilently,
    logout,
} = useAuth0();

const defaultRoute = { path: "main" };
let route = ref(defaultRoute);
let { state: asyncRoute } = useAsyncState(getRoute);
watch(asyncRoute, (currentValue) => {
    if (!currentValue) return;
    route.value = currentValue;
});
let loading = reactive({
    login: false,
});
function themeHandler() {
    theme.value = theme.value === "light" ? "dark" : "light";
    updateSetting("theme", theme.value);
}
async function getAccessTokenSilentlyWrapper() {
    const token = await getAccessTokenSilently({
        redirect_uri: `chrome-extension://${extensionId}`,
    });
    chrome.runtime.sendMessage(extensionId, {
        command: "auth",
        credentials: {
            user: user.value,
            token
        },
    });
}
getAccessTokenSilentlyWrapper();
async function login() {
    try {
        loading.login = true;
        if (!isAuthenticated.value) {
            await loginWithPopup();
            getAccessTokenSilentlyWrapper();
        } else {
            await chrome.runtime.sendMessage(extensionId, {
                command: "signout",
            });
            await logout({
                localOnly: true,
            });
        }
    } catch (error) {
        console.error(error);
    } finally {
        loading.login = false;
    }
}
function getRoute() {
    chrome.runtime.sendMessage(
        extensionId,
        { command: "getRoute" },
        (response) => (route.value = response || defaultRoute)
    );
}
function routeHandler(path) {
    route.value = { ...route.value, path };
    chrome.runtime.sendMessage(
        extensionId,
        {
            command: "commit",
            store: "session", // chrome storage type (i.e. local, session, sync)
            obj: "route",
            key: "path",
            value: route.value.path,
        },
        (response) => {
            console.log("route response: ", response);
        }
    );
}
const username = computed(() => {
    return user?.sub || sessionId.match(/[^|]*/)[0]
})
provide('username', username);
</script>
