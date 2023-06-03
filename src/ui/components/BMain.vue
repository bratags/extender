<template>
    <v-container id="main" class="h-100 pa-0 bmain">
        <b-tag v-if="tags.length" :tags="tags" :bra="bra" :isNew="isNew"></b-tag>
        <b-bra v-else-if="!tags.length && bra" :bra="bra"></b-bra>
        <b-unknown v-else-if="unknown" :unknown="unknown"></b-unknown>
        <b-progress v-else />
    </v-container>
</template>
<style scoped></style>
<script setup>
import { ref, computed } from "vue"
import BTag from "./BTag.vue"
import BBra from "./BBra.vue"
import BUnknown from "./BUnknown.vue"
import BProgress from "./BProgress.vue"

const props = defineProps({
    message: Object,
})
const tags = computed(() => {
    return props.message?.tags || []
})
const isNew = computed(() => {
    return props.message?.isNew
})
const bra = computed(() => {
    return props.message?.bra || props.message?.tags?.bra
})
const unknown = computed(() => {
    return props.message?.unknown
})
</script>
