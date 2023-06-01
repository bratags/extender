<template>
    <iframe v-show="loaded" ref="frame" frameborder="0" scrolling="no" :src="src"></iframe>
    <b-progress v-if="!loaded" />
    <b-snackbar v-model="snackbar"></b-snackbar>
</template>
<style scoped>
iframe {
    overflow: hidden;
    height: 100%;
    width: 100%;
}
</style>
<script setup>
import { ref, computed, onMounted, inject } from "vue"
import { useTheme } from 'vuetify'

import BProgress from "./BProgress.vue"
import BSnackbar from './BSnackbar'

const sessionId = inject("sessionId")
const theme = useTheme()
const { VITE_SERVER } = import.meta.env
const snackbar = ref({
    header: undefined,
    message: undefined,
    enabled: false
})
const frame = ref()
const loaded = ref(false)
const props = defineProps({
    tags: Array,
    bra: Object,
    isNew: Boolean
})
const tag = computed(() => {
    return props.bra && props.tags.find(tag => tag.band === props.bra.band) || props.tags[0]
})
const src = computed(() => {
    const bra = props.bra ? JSON.stringify({ band: props.bra.band, cup: props.bra.cup, color: props.bra.color }) : undefined
    
    return bra
        ? `https://${VITE_SERVER}/tag/gtin/${tag.value.gtin}?ui=extension-popup&bra=${encodeURIComponent(bra)}&theme=${theme.name.value}&sessionId=${sessionId}`
        : `https://${VITE_SERVER}/tag/${tag.value._id}?ui=extension-popup&theme=${theme.name.value}&sessionId=${sessionId}`
})
onMounted(() => {
    frame.value.addEventListener('load', () => loaded.value = true)
    if (props.isNew) {
        snackbar.value = {
            header: `A new tag has been created! 🎉`,
            enabled: true
        }
    }
})
</script>
