const { spawn } = require('child_process');
const { test, expect, ids, basename, appShortName } = require('./fixtures');

module.exports = (async () => {
    test.describe(() => {
        test(`popup - ${basename(__filename)} - 1`, async ({ page, context, serviceWorker }) => {
            await test.step('popup should load', async () => {
                await page.goto(`chrome-extension://${serviceWorker.url().split('/')[2]}/dist/index.html`);
                await new Promise(resolve => setTimeout(resolve, 1000))
                await page.bringToFront();
                await expect(page.locator('body')).toContainText(appShortName, { useInnerText: true });
            });
        });
    });
})();