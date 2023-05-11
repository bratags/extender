<template>
    <v-container class="h-100 d-flex align-center justify-center">
        <unknown-form v-if="!unknown.validSource" :url="unknown.url"></unknown-form>
        <div v-else>
            <div class="mb-4">
                <p class="text-h5" v-html="i18n.getMessage(`BBra1`, username)"></p>
                <p class="text-body-1 mb-2" v-html="i18n.getMessage(`BBra2`)"></p>
                <p class="text-body-1 mb-2">
                    {{ i18n.getMessage(`BBra3`) }}
                </p>
                <v-alert v-if="showNoticeSettingsLink" density="compact" border="start" color="warning" icon="warning"
                    variant="outlined" title="notice preference not set">
                    <template v-slot:text>
                        <span v-html="i18n.getMessage(`BBra4`, settingsURL)"></span>
                    </template>
                </v-alert>
            </div>

            <div class="d-flex justify-center">
                <b-tag-notify :bra="bra"></b-tag-notify>
            </div>
        </div>
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
import UnknownForm from './UnknownForm.vue'

const { VITE_SERVER } = import.meta.env
const extensionId = inject("extensionId")
const {
    user
} = useAuth0()
const i18n = inject("i18n")
const username = inject("username")
const props = defineProps({
    unknown: {
        type: Object,
        required: true
    }
})
const cookie = ref()
chrome.runtime.sendMessage(extensionId, {
    command: 'cookie'
}, response => cookie.value = response)
const showNoticeSettingsLink = computed(() => {
    return cookie.value?.webpush || cookie.value?.email ? false : true
})
const settingsURL = computed(() => `https://${VITE_SERVER}/settings`)
const bra = computed(() => ({
    gtin: '00000000000000',
    brand: 'bratags',
    name: `bratags-${Date.now()}`,
    style: 'bratags',
    color: {
        hex: '000000',
        name: 'bratags'
    },
    band: 28,
    cup: 'r',
    url: props.unknown.url,
    date: new Date(),
    shop: 'bratags'
}))
</script>
