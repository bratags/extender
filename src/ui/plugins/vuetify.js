/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
//import 'vuetify/styles'

// Composables
import { createVuetify } from "vuetify";
import { aliases, md } from "vuetify/iconsets/md";

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
    icons: {
        defaultSet: "md",
        aliases,
        sets: {
            md,
        },
    },
    theme: {
        themes: {
            light: {
                colors: {
                    primary: '#F3C5C5',
                    secondary: '#C1A3A3',
                    tertiary: '#886F6F',
                    quaternary: '#694E4E'
                },
            },
        },
    },
});
