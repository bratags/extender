<template>
    <v-container class="h-100 pa-0 d-flex flex-column">
        <div v-if="!receipt">
            <div class="text-h5 text-capitalize mb-4">Unsupported Bra Source</div>
            <p class="text-body-1">The current page does not seem to be on <a :href="`https://${VITE_SERVER}/list`"
                    target="_blank" rel="noopener">our current list</a> of supported sites.</p>
            <p class="text-body-1 mb-4">Please use this form to let us know about a site you would like to have added, and
                we
                will work on building in the added support!</p>
            <v-form v-model="valid" @submit.prevent="submit" class="d-flex flex-column w-100">
                <v-text-field class="mb-2" label="link" validate-on="blur" v-model="form.fields.url" :rules="form.rules.url"
                    variant="outlined" hint="bra source url" persistent-hint prepend-icon required>
                    <template v-slot:prepend-inner="{ isActive }">
                        <v-icon :color="isActive ? 'primary' : ''" icon="link"></v-icon>
                    </template>
                </v-text-field>
                <v-textarea class="mb-2" label="notes" rows="2"
                    hint="Any additional information that may be helpful in adding support for the site." persistent-hint
                    v-model="form.fields.notes" :rules="form.rules.notes"></v-textarea>
                <v-btn class="mb-8 mx-16 text-h6 text-uppercase" variant="tonal" color="primary" :loading="loading"
                    :disabled="valid !== undefined && !valid" :rounded="loading ? 'xl' : undefined"
                    :class="loading ? 'mx-auto px-16' : ''" type="submit" @click="submit">submit
                </v-btn>
            </v-form>
        </div>
        <div class="d-flex flex-column align-center justify-center mx-16 h-100" v-else>
            <p class="text-h5">Thank you.</p>
            <p class="text-body-1 mb-4">
                We received your feedback about this source.
            </p>
            <p class="text-body-1 mb-8">
                Note: You can always use our <a href="https://bratags.com/faq" target="_blank" rel="noopener">web
                    form</a> to tag any bras, even if the source isn't yet supported as in this case. In fact doing so will
                help speed the process of adding full support for the source.
            </p>
        </div>
        <v-spacer></v-spacer>
        <p class="text-center">
            Please visit <a href="https://bratags.com/faq" target="_blank"
                rel="noopener">https://bratags.com/faq</a> if
            you need more help.
        </p>
    </v-container>
    <b-snackbar v-model="snackbar"></b-snackbar>
</template>
<script setup>
import { ref, inject, computed, onMounted, watch } from "vue"

import BSnackbar from './BSnackbar'

const { VITE_SERVER, VITE_API_SERVER } = import.meta.env
const props = defineProps({
    url: {
        type: String,
        required: true
    }
})

const i18n = inject("i18n")
const username = inject("username")
const extensionId = inject("extensionId")
const valid = ref()
const receipt = ref()
const snackbar = ref()
const loading = ref(false)
const form = ref({
    fields: {
        url: props.url,
        notes: undefined,
    },
    rules: {
        url: [
            v => !!v || i18n.getMessage('BUnknownRule1a'),
            v => v && /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(v) || i18n.getMessage('BUnknownRule1b'),
        ],
        notes: [
            v => !v || (v.length <= 500 || i18n.getMessage('BUnknownRule2a'))
        ]
    }
})
const submit = async (event) => {
    const results = await event

    if (results.valid) {
        loading.value = true
        try {
            const response = await fetch(`https://${VITE_API_SERVER}/v1/user/form-unknown-source`,
                {
                    mode: "cors",
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        url: form.value.fields.url,
                        notes: form.value.fields.notes,
                        username: username.value
                    })
                })
            if (!response.ok) {
                throw Error(`HTTP error: ${response.status}`)
            }
            await new Promise(resolve => setTimeout(resolve, 1500))
            loading.value = false
            receipt.value = await response.json()
            chrome.runtime.sendMessage(extensionId, {
                command: "unknown",
                url: form.value.fields.url,
                id: receipt.value
            })
        } catch (error) {
            console.log(error.message)
            snackbar.value = {
                icon: 'error',
                header: `Error`,
                message: error.message,
                enabled: true
            }
            await new Promise(resolve => setTimeout(resolve, 1500))
            loading.value = false
        }
    }
}
</script>