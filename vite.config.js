import fs from 'node:fs'

const cert = fs.existsSync('./localdev.crt') ? fs.readFileSync('./localdev.crt') : undefined
const key = fs.existsSync('./localdev.key') ? fs.readFileSync('./localdev.key') : undefined

// Plugins
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

// Utilities
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

const { MODE } = process.env;

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
    return {
        plugins: [
            vue(),
            // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
            vuetify({
                autoImport: true,
            }),
        ],
        define: {
            'process.env': {}
        },
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src/ui', import.meta.url))
            },
            extensions: [
                '.js',
                '.json',
                '.jsx',
                '.mjs',
                '.ts',
                '.tsx',
                '.vue',
            ],
        },
        server: {
            port: 3070,
            https: MODE === 'production' ? {
                cert,
                key
            } : undefined
        }
    }
})
