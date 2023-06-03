const { test, expect, basename, appShortName } = require('./fixtures')

module.exports = (async () => {
    test.describe(() => {
        test(`popup - ${basename(__filename)} - 1`, async ({ page, context, serviceWorker }) => {
            await test.step('popup should load', async () => {
                await page.goto(`chrome-extension://${serviceWorker.url().split('/')[2]}/dist/index.html`)
                await new Promise(resolve => setTimeout(resolve, 1000))
                await page.bringToFront()
                await page.waitForSelector('#main')
                await expect(await page.locator('body')).toContainText(new RegExp(appShortName, 'i'), { useInnerText: true })
            })
        })
    })
})()