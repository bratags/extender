const { test, expect, basename, appShortName } = require('./fixtures')

module.exports = (async () => {
    test.describe(() => {
        test(`popup - ${basename(__filename)} - 1`, async ({ page, context, serviceWorker }) => {
            await test.step('popup should load', async () => {
                const page = await context.newPage();
                await page.goto(`chrome-extension://${serviceWorker.url().split('/')[2]}/dist/index.html`)
                await page.bringToFront()
                await expect(await page.locator('#main')).toContainText(new RegExp(appShortName, 'i'), { useInnerText: true })
            })
        })
    })
})()