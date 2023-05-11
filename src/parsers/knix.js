(() => {
    const url = document.location.href;
    const reHexColors = new RegExp(/#([a-f0-9]{6})/i);
    const shop = "knix";
    const pdp = document.querySelector(".cProduct#pdp");
    const dataConfig = pdp.getAttribute("data-config");
    const images = JSON.parse(dataConfig).product.images;
    const product = JSON.parse(Array.from(document.querySelectorAll('#MainContent > div.sProduct > script')).map(el => el.innerHTML).find(el => el.match(/gtin12/)))

    
    const color = {
        name: document.querySelector(
            "#pdp > div:nth-child(2) > div.cProduct-colContainer--right.cProduct-colContainer--right-bottom > div.cProduct-colContainer.cProductMain-right--bottom.cProductMain-form > div:nth-child(4) > div > div > div.cSwatch-elements > button.cVariant.cVariantCombine.selected"
        ).innerText,
        hex: document.querySelector(
            "#pdp > div:nth-child(2) > div.cProduct-colContainer--right.cProduct-colContainer--right-bottom > div.cProduct-colContainer.cProductMain-right--bottom.cProductMain-form > div:nth-child(4) > div > div > div.cSwatch-elements > button.cVariant.cVariantCombine.selected > span"
        ).getAttribute('style').match(reHexColors)?.[1]
    };
    const band = document.querySelector("#d2 > span").innerText;
    const cup = document.querySelector("#d3 > span").innerText;

    const data = {
        url,
        shop,
        band: Number(band),
        cup,
        gtin: `${product.gtin12}`,
        brand: product.brand,
        name: product.name,
        style: product.name.match(/sports|nursing|wireless|everyday|contour/i)?.[0],
        color,
        images,
        price: product.offers.price,
        date: Date.now(),
    };

    return data;
})();
