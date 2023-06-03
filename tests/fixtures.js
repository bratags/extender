const os = require('os');
const fs = require('fs');
const { join, basename } = require('path');
const { test, expect, chromium } = require('@playwright/test');

module.exports = {
    expect,
    appShortName: JSON.parse(fs.readFileSync(join(process.cwd(), '_locales/en_US/messages.json'), 'utf-8')).appShortName.message,
    basename,
    test: test.extend({
        context: async ({}, use, testInfo) => {
            const pathToExtension = process.env?.PATH_TO_EXTENSION || process.cwd();
            // very important to separate userDataDir between tests!
            const userDataDir = `${os.tmpdir()}/test-user-data-dir/${testInfo.title.replaceAll(' ', '_')}-${testInfo.project.name}-${Date.now()}`;
            const context = await chromium.launchPersistentContext(userDataDir, {
                headless: false,
                args: [
                    `--disable-extensions-except=${pathToExtension}`,
                    `--load-extension=${pathToExtension}`,
                    '--no-sandbox'
                ],
                slowMo: process.env.CI ? undefined : 250,
                devtools: false,
                screen: {
                    width: 800,
                    height: 600
                },
                viewport: {
                    width: 800,
                    height: 600
                },
            });
            await use(context);
            await context.close();
        },
        serviceWorker: async ({ context }, use) => {
            let [background] = context.serviceWorkers();
            if (!background) {
                background = await context.waitForEvent('serviceworker');
            }

            await use(background);
        }
    }),
    ids: {
        theme: {
            dark: '.v-application.v-theme--dark',
            light: '.v-application.v-theme--light',
        },
        buttons: {
            theme: 'button[id="theme"]',
            logout: 'button[id="logout"]',
            login: 'button[id="login"]',
            settings: 'button[id="settings"]'
        }
    }
}