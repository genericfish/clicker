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
        },
        create_row: (tower, number) => {
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
        },
        create_shop: () => {
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
        },
        update_buildings: () => {
            windows[2].innerHTML = ""

            for (tower in towers) {
                let count = game.towers[tower][0]
                if (!count) continue

                let fieldset = document.createElement("fieldset")
                let legend = document.createElement("legend")
                let container = document.createElement("div")

                legend.innerHTML = towers[tower].name + " x " + count

                container.classList.add("row-container")

                for (let x = 0; x < Math.floor(count / 10); x++)
                    container.appendChild(graphics.create_row(tower, 10))

                if (count % 10 > 0)
                    container.appendChild(graphics.create_row(tower, count % 10))

                fieldset.setAttribute("style", "border: 1px solid black;")
                fieldset.appendChild(legend)
                fieldset.appendChild(container)

                windows[2].appendChild(fieldset)
            }
        }
    }

    let towers = {
        autoclicker: {
            name: "triggerbot",
            base_cost: 10,
            cost_multiplier: 1.013,
            base_rate: .25,
            base_click: 0,
        },
        stream: {
            name: "bigfollows",
            base_cost: 175,
            cost_multiplier: 1.0135,
            base_rate: 2,
            base_click: 0,
        },
        coomfactory: {
            name: "coom factory",
            base_cost: 2000,
            cost_multiplier: 1.01375,
            base_rate: 10,
            base_click: 0,
        },
        dogfarm: {
            name: "dog farm",
            base_cost: 10000,
            cost_multiplier: 1.014,
            base_rate: 60,
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

    function setup() {
        if (window.localStorage["gamestate"] == undefined)
            save()

        game_load = JSON.parse(window.atob(window.localStorage["gamestate"]))

        if (game.last_save === undefined)
            game.last_save = Date.now()

        // Copy first level nested objects
        for (let key in game)
            if (game_load.hasOwnProperty(key))
                if (game[key] instanceof Object)
                    game[key] = Object.assign(game[key], game_load[key])
                else
                    game[key] = game_load[key]

        graphics.create_shop()
        graphics.update_buildings()

        let clicker = (() => {
            let last_click = Date.now()

            display.button.addEventListener("mousedown", e => {
                let now = Date.now()
                if (now - last_click <= 77) return

                let amount = game.modifiers.click[0] + 1

                if (goldenkhoi_active)
                    amount += Math.max(game.rate * .15, 5)

                amount += game.rate * .01

                last_click = now

                add_goo(amount)
                graphics.floater(Math.round(amount * 100) / 100, e.clientX, e.clientY)
                graphics.bounce()
            })
        })()
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

        // Refund 92.5% of the buy price.
        shop.active_refund = Math.ceil(
            geometric_sum(
                tower.base_cost * tower.cost_multiplier **
                    (game.towers[shop.active][0] - shop.active_amount),
                tower.cost_multiplier,
                shop.active_amount
            ) * .925
        )

        if (shop.active_cost > game.gamergoo)
            shop.stats.buy.setAttribute("disabled", "disabled")
        else
            shop.stats.buy.removeAttribute("disabled")

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

    // Golden appears every 1 to 6 minutes
    let goldenkhoi = Math.ceil((Math.random() * 18000) + 300)
    let goldenkhoi_active = false

    function make_khoi() {
        let khoi = document.createElement("div")
        let removed = false

        khoi.setAttribute("id", "goldenkhoi")
        khoi.setAttribute("style",
            `top:${Math.ceil(Math.random() * 70) + 15}%;` +
            `left:${Math.ceil(Math.random() * 70) + 15}%;`
        )

        khoi.addEventListener("click", e => {
            goldenkhoi_active = true
            document.body.removeChild(khoi)

            for (let x = 1; x <= 3; x++) windows[x].parentElement.classList.add("khoi")

            setTimeout(() => {
                goldenkhoi_active = false
                removed = true
                for (let x = 1; x <= 3; x++) windows[x].parentElement.classList.remove("khoi")
            }, 10000)
        })

        setTimeout(() => {
            if (!removed) document.body.removeChild(khoi)
        }, 45000)

        document.body.appendChild(khoi)
    }

    let last_click = Date.now()

    document.addEventListener("click", (e) => {
        last_click = Date.now()
    })

    let loop = (() => {
        let last_frame = Date.now()
        let frames = 0
        let last_updates = [0,0,0]

        return () => {
            let focused = !document["hidden"]
            let now = Date.now()

            // Approximately 100 FPS
            if (now - last_frame >= 10)
                frames += Math.round((now - last_frame) / 10)

            // Every other frame (~20ms) add 1/50th of goo
            if (frames - last_updates[0] >= 2) {
                last_updates[0] = frames

                let goo = undefined

                if (!focused) {
                    goo = game.rate
                    document.title = nice_format(Math.round(game.gamergoo)) + " gamergoo | Khoima Clicker"
                    save()
                } else goo = game.rate / 50

                if (now - last_click > 300000) goo *= .15

                add_goo(goo)
            }

            // Every 25th frame (~250ms) update shop buy button
            if (frames - last_updates[1] >= 25) {
                if (shop.active_cost > game.gamergoo)
                    shop.stats.buy.setAttribute("disabled", "disabled")
                else
                    shop.stats.buy.removeAttribute("disabled")

                document.title = nice_format(Math.round(game.gamergoo)) + " gamergoo | Khoima Clicker"
                last_updates[1] = frames
            }

            // Save game every second (~100 frames)
            if (frames - last_updates[2] >= 25) {
                save()
                last_updates[2] = frames
            }

            if (frames == goldenkhoi) {
                goldenkhoi = frames + Math.ceil((Math.random() * 30000) + 6000)
                make_khoi()
            }

            last_frame = now
        }
    })

    setInterval(loop(), 10)

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
        shop: (action) => {
            let update = false

            if (action == "buy" && game.gamergoo >= shop.active_cost) {
                add_goo(-shop.active_cost)
                game.towers[shop.active][0] += shop.active_amount
                update = true
            } else if (action == "sell" && game.towers[shop.active][0] >= shop.active_amount) {
                add_goo(shop.active_refund, false)
                game.towers[shop.active][0] -= shop.active_amount
                update = true
            }

            if (update) {
                update_costs()
                update_rates()
                graphics.update_buildings()

                shop.stats.owned.innerHTML = game.towers[shop.active][0]
                shop.stats.producing.innerHTML = nice_format(game.towers[shop.active][1].toFixed(2))

                save()
            }
        },
        stats: () => {
            console.log(
                "gamergoo: " + game.gamergoo + '\n' +
                "total gamergoo: " + game.gamergoo_history + '\n'
            )
        },
        wipe: () => {
            running = false
            setTimeout(() => {
                window.localStorage.removeItem("gamestate")
                window.location.reload()
            }, 100)
        },
        hack: (amt) => { add_goo(amt, false) }
    }
})()

game.start()