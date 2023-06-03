const { test, expect, basename, appShortName } = require('./fixtures')

module.exports = (async () => {
    test.describe(() => {
        test(`popup - ${basename(__filename)} - 1`, async ({ page, context, serviceWorker }) => {
            await test.step('popup should load', async () => {
                const page = await context.newPage()
                await page.goto(`chrome-extension://${serviceWorker.url().split('/')[2]}/dist/index.html`)
                expect(true)
            })
            await test.step('popup should render', async () => {
                await page.goto(`chrome-extension://${serviceWorker.url().split('/')[2]}/dist/index.html`)
                console.log(await page.content())
                await expect(await page.locator('#main')).toContainText(new RegExp(appShortName, 'i'), { useInnerText: true })
            })
        })
    })
})()