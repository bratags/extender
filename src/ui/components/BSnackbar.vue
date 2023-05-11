<template>
    <v-snackbar color="quaternary" v-model="snackbar.enabled" rounded="lg">
        <div class="text-h6 font-weight-bold pb-2">
            <v-icon color="primary" :icon="snackbar?.icon || 'info'" class="mr-2"></v-icon>{{ snackbar.header }}
        </div>

        <p v-if="snackbar.message"><span v-html="snackbar.message"></span></p>

        <template v-slot:actions>
            <v-btn color="primary" variant="text" @click="snackbar.enabled = false">
                Close
            </v-btn>
        </template>
    </v-snackbar>
</template>
<script setup>
import { until } from 'async'
import { ref, watch } from 'vue'

const props = defineProps({
    modelValue: Object
})
const snackbar = ref(props.modelValue || {
    enabled: false, // NODE_ENV === 'production' ? false : true,
    header: undefined, // NODE_ENV === 'production' ? undefined : 'A new price notice set for Knix',
    message: undefined, // NODE_ENV === 'production' ? undefined : 'A notice will be sent when your desired price of $66.70 is reached.'
})
const snackbars = ref([])
watch(() => props.modelValue, (newValue, oldValue) => {
    if (newValue && newValue !== oldValue) {
        snackbars.value.push(newValue)
    }
})
watch(
    snackbars, (value) => {
        if (value.length) {
            (async () => {
                await until(
                    callback => callback(null, !snackbar.value?.enabled),
                    async () => await new Promise(resolve => setTimeout(resolve, 500))
                )
                snackbar.value = value.pop() || {
                    enabled: false,
                    header: undefined,
                    message: undefined,
                }
            })()
        }
    }, {
    deep: true
}
)
</script>