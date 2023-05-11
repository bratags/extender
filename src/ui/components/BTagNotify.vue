<template>
    <v-sheet width="400">
        <v-form v-if="!snackbar.enabled" v-model="valid" @submit.prevent="submit" class="d-flex flex-column">
            <b-price-suggestion :price="data.fields.price" :disableSuggestion="bra?.gtin == '00000000000000'" @price="priceSuggestionHandler"></b-price-suggestion>
            <v-btn :loading="loading" :disabled="!valid" :rounded="loading ? 'xl' : undefined"
                class="text-h6 text-uppercase" :class="loading ? 'mx-auto' : ''" type="submit">{{
                    i18n.getMessage('tag') }}
                <template v-slot:prepend>
                    <v-icon icon="new_label" color="primary"></v-icon>
                </template>
            </v-btn>
        </v-form>
        <b-snackbar v-model="snackbar"></b-snackbar>
    </v-sheet>
</template>
<script setup>
import { ref, inject, computed, watch } from "vue"
import { useAuth0 } from "@auth0/auth0-vue"

import BPriceSuggestion from './BPriceSuggestion'
import BSnackbar from './BSnackbar'

const { VITE_API_SERVER } = import.meta.env
const {
    user
} = useAuth0()
const snackbar = ref({
    header: undefined, // MODE === 'production' ? undefined : `A new tag was created.`,
    message: undefined, // MODE === 'production' ? undefined : `View <a href="${`https://${VITE_SERVER}/tag/`}" rel="noopener" target="_blank">tag details here</a>.`,
    enabled: false // MODE === 'production' ? false : true
})
const i18n = inject("i18n")
const username = inject('username')
const extensionId = inject("extensionId")
const valid = ref()
const loading = ref(false)
const data = ref({
    fields: {
        price: undefined,
    }
})
const props = defineProps({
    bra: Object,
})
const priceSuggestionHandler = (price) => {
    data.value.fields.price = typeof price === 'array' ? price.pop() : price
}
const submit = async (event) => {
    const results = await event

    if (results.valid) {
        loading.value = true
        try {
            const response = await fetch(`https://${VITE_API_SERVER}/v1/tag`,
                {
                    mode: "cors",
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        bra: {
                            brand: props.bra.brand,
                            name: props.bra.name,
                            style: props.bra.style,
                            color: props.bra.color,
                            band: props.bra.band,
                            cup: props.bra.cup
                        },
                        tag: {
                            gtin: props.bra.gtin,
                            images: props.bra.images,
                            price: {
                                date: props.bra.date,
                                source: {
                                    url: props.bra.url,
                                    shop: props.bra.shop,
                                    seller: props.bra.seller,
                                    amount: data.value.fields.price
                                }
                            },
                            creator: username.value
                        }
                    })
                })
            if (!response.ok) {
                throw Error(`HTTP error: ${response.status}`)
            }
            chrome.runtime.sendMessage(extensionId, {
                command: "tag",
                url: props.bra.url,
                gtin: props.bra.gtin
            })
            await new Promise(resolve => setTimeout(resolve, 3000))
            loading.value = false
            const json = await response.json()
            chrome.runtime.sendMessage(extensionId, {
                command: 'getNewTag',
                id: json.tagId
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
watch(valid, valid => {
    if (!valid) {
        data.value.disablePriceSuggestion = valid
    }
})
</script>
