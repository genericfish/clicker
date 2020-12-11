const english_numbers = [
    "million",
    "billion",
    "trillion",
    "quadrillion",
    "quintillion",
    "sextillion",
    "septillion",
    "octillion",
    "nonillion",
    "undecillion",
    "duodecillion",
    "tredecillion",
    "quattuordecillion",
    "quindecillion",
    "sexdecillion"
    // septendecillion = 10^54, however JS safe upperlimit is 10^53 - 1
]

function nice_format(num) {
    let digits = Math.floor(Math.log10(num))

    if (digits < 6) return num

    let place = Math.floor((digits - 6) / 3)
    return (num / (10 ** (3 * Math.floor(digits / 3)))).toFixed(3) +
        " " + english_numbers[place]
}

let windows = [
    null,
    document.getElementById("window-1"),
    document.getElementById("window-2"),
    document.getElementById("window-3")
]

function minimize(win) {
    windows[win].classList.add("minimize")
}

function maximize(win) {
    windows[win].classList.remove("minimize")
}

let game = (() => {
    let running = true

    let graphics = {
        bounce: (() => {
            return () => {
                display.button.classList.add("clicked")
                setTimeout(() => {
                    display.button.classList.remove("clicked")
                }, 300)
            }
        })(),
        floater: (amount, x, y) => {
            let container = document.createElement("div")
            let floater = document.createElement("div")
            let display = document.createElement("div")

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
    }

    let towers = {
        autoclicker: {
            name: "triggerbot",
            base_cost: 10,
            cost_multiplier: 1.0135,
            base_rate: .35,
            base_click: 0,
        },
        stream: {
            name: "bigfollows",
            base_cost: 250,
            cost_multiplier: 1.0135,
            base_rate: 5,
            base_click: 0
        },
        coomfactory: {
            name: "coom factory",
            base_cost: 2000,
            cost_multiplier: 1.0175,
            base_rate: 50,
            base_click: 0,
        },
        dogfarm: {
            name: "dog farm",
            base_cost: 6500,
            cost_multiplier: 1.0181,
            base_rate: 125,
            base_click: 0,
        },
    }

    let display = {
        rate: document.getElementById("cps"),
        total: document.getElementById("counter"),
        button: document.getElementById("kfc")
    }

    let game = {
        towers: {
            autoclicker: [0,0],
            stream: [0,0],
            coomfactory: [0,0],
            dogfarm: [0,0],
        },
        modifiers: {
            click: [0,0],
            offline: [0,0],
            autoclicker: [0,0],
            stream: [0,0],
            coomfactory: [0,0],
            dogfarm: [0,0],
        },
        gamergoo: 0.0,
        gamergoo_history: 0.0,
        rate: 0.0,
        last_save: Date.now()
    }

    function save() {
        game.last_save = Date.now()
        window.localStorage["gamestate"] = window.btoa(JSON.stringify(game))
    }

    function add_goo(amt, add) {
        add = add === undefined

        game.gamergoo += amt

        if (amt > 0 && add)
            game.gamergoo_history += amt

        display.total.innerHTML = nice_format(Math.round(game.gamergoo))
    }

    display.button.addEventListener("mousedown", e => {
        let amount = game.modifiers.click[0] + 1

        add_goo(amount)
        graphics.floater(amount, e.clientX, e.clientY)
        graphics.bounce()
    })

    let shop = {
        listings: document.getElementById("listings"),
        active: undefined,
        active_amount: 1,
        active_cost: 1,
        active_refund: 1,
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
            refund: document.getElementById("shop-refund"),
            refundcontainer: document.getElementById("shop-refund-container"),
            sell: document.getElementById("shop-sell"),
            buy: document.getElementById("shop-buy"),
            owned: document.getElementById("stats-owned"),
            producing: document.getElementById("stats-producing")
        }
    }

    function create_shop() {
        for (tower in towers) {
            let listing = document.createElement("li")
            let link = document.createElement("a")

            let eventHandler = (tower) => {
                return () => {
                    shop.stats.header.innerHTML = towers[tower].name
                    shop.stats.rate.innerHTML = towers[tower].base_rate
                    shop.stats.click.innerHTML = towers[tower].base_click
                    shop.active = tower

                    shop.stats.owned.innerHTML = game.towers[shop.active][0]
                    shop.stats.producing.innerHTML = nice_format(game.towers[shop.active][1].toFixed(2))

                    update_costs()
                }
            }

            link.addEventListener("click", eventHandler(tower))

            if (tower == "autoclicker") link.click()

            link.href = "#"
            link.innerHTML = towers[tower].name
            listing.appendChild(link)
            shop.listings.appendChild(listing)
        }

        shop.stats.radio[0].click()
    }

    function create_row(tower, number) {
        let row = document.createElement("div")

        row.setAttribute(
            "style",
            `background: url(assets/${tower}.png);` +
            "background-size: 45px 45px;" +
            "height: 45px;" +
            `width: ${number * 45}px;` +
            "margin: 0 auto;"
        )

        return row
    }

    function update_buildings() {
        windows[2].innerHTML = ""

        for (tower in towers) {
            let count = game.towers[tower][0]
            if (!count) continue

            let fieldset = document.createElement("fieldset")
            let legend = document.createElement("legend")

            legend.innerHTML = towers[tower].name

            for (let x = 0; x < Math.floor(count / 10); x++)
                fieldset.appendChild(create_row(tower, 10))

            if (count % 10 > 0)
                fieldset.appendChild(create_row(tower, count % 10))

            fieldset.setAttribute("style", "border: 1px solid black;")
            fieldset.appendChild(legend)

            windows[2].appendChild(fieldset)
        }
    }

    function setup() {
        if (window.localStorage["gamestate"] == undefined)
            save()

        game_load = JSON.parse(window.atob(window.localStorage["gamestate"]))

        if (game.last_save === undefined)
            game.last_save = Date.now()

        if (game.save_version === undefined || game.save_version < 3) {
            // Copy first level nested objects
            for (let key in game)
                if (game_load.hasOwnProperty(key))
                    if (game[key] instanceof Object)
                        game[key] = Object.assign(game[key], game_load[key])
                    else
                        game[key] = game_load[key]

            game.save_version = 3
        }

        create_shop()
        update_buildings()
    }

    function geometric_sum(base, ratio, exp) {
        // Geometric Partial Sum
        return Math.ceil(
            base * (1 - ratio ** exp) /  (1 - ratio)
        )
    }

    function update_costs() {
        let tower = towers[shop.active]

        shop.active_cost = geometric_sum(
            tower.base_cost * tower.cost_multiplier ** game.towers[shop.active][0],
            tower.cost_multiplier,
            shop.active_amount
        )

        shop.active_refund = geometric_sum(
            tower.base_cost * tower.cost_multiplier **
                (game.towers[shop.active][0] - shop.active_amount),
            tower.cost_multiplier,
            shop.active_amount
        )

        if (shop.active_amount > game.towers[shop.active][0]) {
            shop.stats.sell.setAttribute("disabled", "disabled")
            shop.stats.refundcontainer.setAttribute("style", "visibility:hidden;")
        } else {
            shop.stats.sell.removeAttribute("disabled")
            shop.stats.refundcontainer.removeAttribute("style")
        }

        shop.stats.cost.innerHTML = nice_format(shop.active_cost)
        shop.stats.refund.innerHTML = nice_format(shop.active_refund)
    }

    function update_rates() {
        game.rate = 0

        for (tower in towers) {
            let rate = game.towers[tower][0] * towers[tower].base_rate
            game.towers[tower][1] = rate
            game.rate += rate
        }

        display.rate.innerHTML = nice_format(game.rate.toFixed(2)) + " gamergoo per second"
    }

    function loop() {
        let now = Date.now()

        if (now - game.last_save >= 100) {
            add_goo(game.rate / 10)
            save()
        }

        if (running)
            window.requestAnimationFrame(loop)
    }

    // exports
    return {
        start: () => {
            running = true
            // Setup save file and shop listings
            setup()

            // Update rates then give user gamergoo based on last save
            update_rates()
            let elapsed_time = (Date.now() - game.last_save) / 1000

            // Maximum offline time is 8 hours
            elapsed_time = (elapsed_time < (8 * 60 * 60)) ? elapsed_time : 8 * 60 * 60

            // Earn goo at a rate of 0.85% of normal rate
            let offline_goo = game.rate * 0.0085 * elapsed_time
            add_goo(offline_goo)

            // Begin main game loop
            loop()
        },
        shop_count: e => {
            shop.active_amount = parseInt(e.value)
            update_costs()
        },
        buy: () => {
            if (game.gamergoo >= shop.active_cost) {
                add_goo(-shop.active_cost)
                game.towers[shop.active][0] += shop.active_amount

                update_costs()
                update_rates()
                update_buildings()

                shop.stats.owned.innerHTML = game.towers[shop.active][0]
                shop.stats.producing.innerHTML = nice_format(game.towers[shop.active][1].toFixed(2))

                save()
            }
        },
        sell: () => {
            if (game.towers[shop.active][0] >= shop.active_amount) {
                add_goo(shop.active_refund, false)
                game.towers[shop.active][0] -= shop.active_amount

                update_costs()
                update_rates()
                update_buildings()

                shop.stats.owned.innerHTML = game.towers[shop.active][0]
                shop.stats.producing.innerHTML = nice_format(game.towers[shop.active][1].toFixed(2))

                save()
            }
        },
        stats: () => {
            console.log(game.gamergoo)
            console.log(game.gamergoo_history)
        },
        wipe: () => {
            running = false
            setTimeout(() => {
                window.localStorage.removeItem("gamestate")
                window.location.reload()
            }, 100)
        }
    }
})()

game.start()