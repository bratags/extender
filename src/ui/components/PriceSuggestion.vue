<template>
    <v-tooltip location="top" v-model="priceSuggestion" :disabled="true">
        <template v-slot:activator="{ props }">
            <v-text-field validate-on="blur" v-bind="props" v-model="data.fields.price" :rules="data.rules.price"
                variant="outlined" @click="priceSuggestion = true && !data.disablePriceSuggestion" @change="emit('price', data.fields.price)"
                v-click-outside="() => priceSuggestion = false" prepend-icon required>
                <template v-slot:prepend-inner="{ isActive }">
                    <v-icon :color="isActive ? 'green-darken-2' : ''" icon="attach_money"></v-icon>
                </template>
            </v-text-field>
        </template>
        <v-row v-if="price">
            <v-col v-for="percent of discounts" :key="percent" @mouseenter="() => setDiscount(percent)"
                class="d-flex flex-column" :class="selected === percent ? 'highlight' : ''" @click="data.disablePriceSuggestion = true">
                <div>{{ `${currencySymbol}${percent}` }}%</div>
                <div>(-{{ money(price * percent / 100, i18n.locale) }})</div>
            </v-col>
        </v-row>
    </v-tooltip>
</template>
<style>
.highlight {
    color: #F3C5C5;
    font-size: larger;
    font-weight: bold;
}
.v-tooltip>.v-overlay__content {
    pointer-events: initial !important;
    cursor: pointer;
}
</style>
<script setup>
import { inject, ref, watch, computed } from 'vue'

const reCurrency = {
    en_US: new RegExp(/^\d+(\.\d{1,2})?$/)
}
const priceSuggestion = ref(false)
const i18n = inject("i18n")
const discounts = [5, 10, 20, 33, 50]
const discount = ref(0)
const selected = ref(0)
const data = ref({
    fields: {
        price: undefined,
    },
    rules: {
        price: [
            v => !!v || i18n.getMessage('BTagNotify3'),
            v => reCurrency[i18n.locale].test(v) || i18n.getMessage('BTagNotify2', i18n.locale)
        ],
    },
    disablePriceSuggestion: props.disableSuggestion
})

const emit = defineEmits(['price'])

watch(discount, (newValue, lastValue) => {
    if (newValue !== lastValue) {
        const discountedPrice = props.price - discount.value;
        emit('price', discountedPrice)
        data.value.fields.price = money(discountedPrice, i18n.locale, 'decimal')
    }
})
const setDiscount = (percent) => {
    selected.value = percent
    discount.value = props.price * percent / 100
}
const props = defineProps({
    price: Number,
    reset: Boolean,
    disableSuggestion: Boolean
})
const currency = {
    en_US: { code: 'USD', symbol: '$' }
}
const money = (amount, locale, style = 'currency') => {
    return Number(amount).toLocaleString(locale.replace('_', '-'), { style, currency: currency[locale]?.code })
}
const currencySymbol = computed(() => currency[i18n.locale].symbol)
</script>
