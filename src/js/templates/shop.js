(() => {
    let win = H.WM.get("shop")

    // Append this in order to force the browser to update
    let content = document.createElement("div")
    content.classList.add("content")

    // Preserve HTML formatting, but reduce whitespaces in code for better minification
    content.innerHTML =
    `<div class="left">` +
        `<ul class="tree-view">` +
            `<li>The Shop</li>` +
            `<li>` +
                `<details open="">` +
                    `<summary>Buildings</summary>` +
                    `<ul id="listings"></ul>` +
                `</details>` +
            `</li>` +
        `</ul>` +
    `</div>` +
    `<div id="stats" class="right">` +
        `<ul class="tree-view">` +
            `<li>` +
                `<span style="color:purple;font-size: 20px;"><span  id="stats-header"></span> <span>stats</span></span>` +
                `<ul style="color:#f00;">` +
                    `<li id="stats-desc"></li>` +
                    `<li>gamergoo per second: +<span id="stats-rate">0.0</span></li>` +
                    `<li>gamergoo per click: +<span id="stats-click">0.0</span></li>` +
                    `<li>` +
                        `<span id="stats-owned">0</span> currently owned` +
                        `<ul>` +
                            `<li>producing <span id="stats-producing">0</span> gamergoo per second</li>` +
                        `</ul>` +
                    `</li>` +
                `</ul>` +
            `</li>` +
        `</ul>` +
        `<fieldset style="margin-top: 12px;border: 1px solid black;">` +
            `<legend>Select Amount</legend>` +
            `<section class="field-row" style="margin-top:6px;">` +
                `<input autocomplete="off" type="radio" name="amount" id="shop-one" onclick="game.shop_count(this);" value="1" aria-selected="true" checked>` +
                `<label for="shop-one">1</label>` +
            `</section>` +
            `<section style="margin-top:6px;">` +
                `<input autocomplete="off" type="radio" name="amount" id="shop-ten" onclick="game.shop_count(this);" value="10">` +
                `<label for="shop-ten">10</label>` +
            `</section>` +
            `<section style="margin-top:6px;">` +
                `<input autocomplete="off" type="radio" name="amount" id="shop-hundred" onclick="game.shop_count(this);" value="100">` +
                `<label for="shop-hundred">100</label>` +
            `</section>` +
        `</fieldset>` +
        `<div style="margin-top:12px;">Cost: <span id="shop-cost">1</span> gamergoo</div>` +
        `<div id="shop-refund-container">Sell: <span id="shop-refund">1</span> gamergoo</div>` +
        `<section class="field-row" style="margin-top: 12px;">` +
            `<button id="shop-buy" onclick="game.shop('buy')">buy</button>` +
            `<button id="shop-sell" onclick="game.shop('sell')">sell</button>` +
        `</section>` +
    `</div>`

    win.appendChild(content)
})()