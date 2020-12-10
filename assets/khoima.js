let gamergoo = 0
let modifiers = {
    click: 1,
    autoclicker: 1
}
let towers = {
    autoclicker: {
        name: "autoclicker",
        base_cost: 15,
        cost_multiplier: 1.005,
        base_rate: .2,
        base_click: 0,
    },
    coomfactory: {
        name: "coom factory",
        base_cost: 1000,
        cost_multiplier: 1.01,
        base_rate: 10,
        base_click: 0,
    },
    dogfarm: {
        name: "dog farm",
        base_cost: 10000,
        cost_multiplier: 1.015,
        base_rate: 100,
        base_click: 0,
    }
}

let game = {
    display: {
        rate: document.getElementById("cps"),
        total: document.getElementById("counter"),
        button: document.getElementById("kfc")
    },
    towers: {
        autoclicker: 0,
        coomfactory: 0,
        dogfarm: 0
    }
}

let bounce = (() => {
    return () => {
        game.display.button.classList.add("clicked")
        setTimeout(() => {
            game.display.button.classList.remove("clicked")
        }, 300)
    }
})()

let summon = (() => {
    let container = document.createElement("div")
    let floater = document.createElement("div")
    let display = document.createElement("div")

    return (amount, x, y) => {
        floater.appendChild(display)
        container.appendChild(floater)

        floater.classList.add("click-float")

        container.setAttribute(
            "style",
            `position:absolute;top:${y - 25}px;left:${x - 20}px;pointer-events:none;`
        )

        display.innerHTML = `+${amount}`

        document.body.appendChild(container)

        setTimeout(() => {
            document.body.removeChild(container)
        }, 1000)
    }
})

function add_goo(amt) {
    gamergoo += amt
    game.display.total.innerHTML = gamergoo.toFixed(2)

    window.localStorage["gamergoo"] = gamergoo
}

game.display.button.addEventListener("mousedown", e => {
    add_goo(modifiers.click)
    summon()(modifiers.click, e.clientX, e.clientY)
    bounce()
})

let shop = {
    listings: document.getElementById("listings"),
    active: undefined,
    active_amount: 1,
    active_cost: 1,
    stats: {
        header: document.getElementById("stats-header"),
        rate: document.getElementById("stats-rate"),
        click: document.getElementById("stats-click"),
        radio: [
            document.getElementById("shop-one"),
            document.getElementById("shop-ten"),
            document.getElementById("shop-hundred"),
        ],
        cost: document.getElementById("shop-cost"),
        buy: document.getElementById("shop-buy")
    }
}

function shop_count(e) {
    shop.active_amount = parseInt(e.value)
    update_costs()
}

function update_costs() {
    let tower = towers[shop.active]
    shop.active_cost = 0

    for (let i = 0; i < shop.active_amount; i++)
        shop.active_cost += Math.ceil(
            tower.base_cost * (tower.cost_multiplier ** (i + game.towers[shop.active]))
        )
    shop.stats.cost.innerHTML = shop.active_cost
}

function buy() {
    if (gamergoo >= shop.active_cost) {
        add_goo(-shop.active_cost)
        game.towers[shop.active] += shop.active_amount
        update_costs()
        window.localStorage["towers"] = JSON.stringify(game.towers)

        let rate = 0

        for (tower in game.towers)
            rate += game.towers[tower] * towers[tower].base_rate

        game.display.rate.innerHTML = rate + " gamergoo per second"
    }
}

function main() {
    if (window.localStorage["gamergoo"] === undefined)
        window.localStorage["gamergoo"] = 0

    if (window.localStorage["towers" === undefined])
        window.localStorage["towers"] = JSON.stringify(game.towers)

    if (window.localStorage["version"] === undefined) {
        window.localStorage["gamergoo"] = 0
        window.localStorage["towers"] = JSON.stringify(game.towers)
        window.localStorage["version"] = 1
    }

    gamergoo = parseFloat(window.localStorage["gamergoo"])
    game.towers = JSON.parse(window.localStorage["towers"])
    game.display.total.innerHTML = gamergoo.toFixed(2)

    let rate = 0

    for (tower in game.towers)
        rate += game.towers[tower] * towers[tower].base_rate

    game.display.rate.innerHTML = rate + " gamergoo per second"

    for (tower in towers) {
        let listing = document.createElement("li")
        let link = document.createElement("a")

        let eventHandler = (tower) => {
            return () => {
                shop.stats.header.innerHTML = tower
                shop.stats.rate.innerHTML = towers[tower].base_rate
                shop.stats.click.innerHTML = towers[tower].base_click
                shop.active = tower

                update_costs()
            }
        }

        link.addEventListener("click", eventHandler(tower))

        if (tower == "autoclicker") link.click()

        link.href = "#"
        link.innerHTML = tower
        listing.appendChild(link)
        shop.listings.appendChild(listing)
    }
}

let last = Date.now()

function loop() {
    let now = Date.now()
    if (now - last >= 50) {
        last = now

        for (tower in game.towers)
            add_goo((game.towers[tower] * towers[tower].base_rate) / 20)
    }

    window.requestAnimationFrame(loop)
}

main()
loop()