<template>
    <v-menu>
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" variant="text" :size="size" :icon="icon" :color="color">
                <slot></slot>
            </v-btn>
        </template>
        <v-list class="rounded-xl">
            <v-list-item v-for="type in data.networks" :key="type.network" density="compact">
                <ShareNetwork url="https://blog.bratags.com" :network="type.network" :title="data.sharing.title"
                    :description="data.sharing.description" :quote="data.sharing.quote" :hashtags="data.sharing.hashtags"
                    :twitterUser="data.sharing.twitterUser">
                    <v-icon class="mr-2" :color="type.color" v-if="!type.network.match(/twitter|whatsapp/)">
                        <span class="material-icons">{{ type.icon }}</span>
                    </v-icon>
                    <icon-base class="mr-2" v-else :icon-name="type.name">
                        <icon-twitter v-if="type.network.match(/twitter/)"></icon-twitter>
                        <icon-whatsapp v-if="type.network.match(/whatsapp/)"></icon-whatsapp>
                    </icon-base>
                    <span>{{ type.name }}</span>
                </ShareNetwork>
            </v-list-item>
        </v-list>
    </v-menu>
</template>
<style scoped>
a {
    text-decoration: none !important;
}
</style>
<script setup>
import { inject } from 'vue'
import VueSocialSharing from "vue-social-sharing"

import IconBase from './IconBase'
import IconTwitter from './IconTwitter'
import IconWhatsapp from './IconWhatsapp'

const i18n = inject("i18n")

const props = defineProps({
    copy: String,
    size: String,
    icon: Boolean,
    color: String,
})
const data = {
    sharing: {
        title: i18n.getMessage('shareTitle'),
        description: i18n.getMessage('shareDescription'),
        quote: i18n.getMessage('shareQuote'),
        hashtags: i18n.getMessage('shareHashtags'),
        twitterUser: "bratags",
    },
    networks: [
        {
            network: "email",
            name: "Email",
            icon: "email",
            color: "#333333",
        },
        {
            network: "facebook",
            name: "Facebook",
            icon: "facebook",
            color: "#1877f2",
        },
        {
            network: "sms",
            name: "SMS",
            icon: "sms",
            color: "#333333",
        },
        {
            network: "twitter",
            name: "Twitter",
            icon: "",
            color: "#1da1f2",
        },
        {
            network: "whatsapp",
            name: "Whatsapp",
            icon: "",
            color: "#25d366",
        },
    ],
}
</script>
