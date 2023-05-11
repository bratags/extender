<template>
    <v-container class="h-100" :class="bra.gtin ? '' : 'd-flex align-center'" ref="bra">
        <div v-if="bra" class="h-100">
            <div class="text-h5">
                <span class="text-capitalize font-weight-bold">{{ bra.shop }}</span>,
                {{ bra.name }},
                <span class="font-weight-medium">{{ bra.band }}{{ bra.cup }}</span>
                <sup class="ml-2">
                    <span class="font-weight-bold" :style="{ 'color': `#${bra.color.hex}` }">{{ bra.color.name }}</span>
                    <span class="swatch ml-1" :style="{ 'background': `#${bra.color.hex}` }"></span>
                </sup>
                <span v-if="bra.price" class="ml-4">${{ Number(bra.price).toFixed(2) }}</span>
            </div>
            <div class="mt-8 mb-4">
                <p class="text-h5" v-html="i18n.getMessage(`BBra1`, username)"></p>
                <p class="text-body-1 mb-2" v-html="i18n.getMessage(`BBra2`)"></p>
                <p class="text-body-1 mb-2">
                    {{ i18n.getMessage(`BBra3`) }}
                </p>
                <v-alert v-if="showNoticeSettingsLink" density="compact" border="start" color="warning" icon="warning" variant="outlined" title="notice preference not set">
                    <template v-slot:text>
                        <span v-html="i18n.getMessage(`BBra4`, settingsURL)"></span>
                    </template>
                </v-alert>
            </div>

            <div class="d-flex justify-center">
                <b-tag-notify :bra="bra"></b-tag-notify>
            </div>
        </div>
        <v-card v-else class="mx-auto" max-width="400" variant="outlined">
            <v-card-item>
                <div class="text-overline font-weight-bold mb-1">
                    {{ bra.shop }}
                </div>
                <div class="text-h5 text-capitalize">bra not found</div>
                <div class="text-caption">at {{ bra.url }}</div>
            </v-card-item>
            <v-card-text>
                <div class="text-body-1 text-center">
                    You must be on a product page.
                </div>
            </v-card-text>
        </v-card>
    </v-container>
</template>
<style scoped>
.swatch {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    display: inline-block;
}
</style>
<script setup>
import { inject, ref, computed } from 'vue'
import { useAuth0 } from "@auth0/auth0-vue"

import BTagNotify from "./BTagNotify.vue"

const { VITE_SERVER } = import.meta.env;
const extensionId = inject("extensionId");
const {
    user
} = useAuth0()
const name = 'BBra'
const i18n = inject("i18n")
const username = inject("username")
const message = defineProps({
    bra: Object,
})
const cookie = ref();
chrome.runtime.sendMessage(extensionId, {
    command: 'cookie'
}, response => cookie.value = response)
const showNoticeSettingsLink = computed(() => {
    return !cookie.value?.webpush && !cookie.value?.email;
})
const settingsURL = computed(() => `https://${VITE_SERVER}/settings`);
</script>
