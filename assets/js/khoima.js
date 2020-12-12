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

const game = (() => {
    const game_worker = new Worker("assets/js/khoima-worker.js")

    const graphics = {
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
            let rows = Math.max(Math.floor(number / 10), 1)

            row.setAttribute(
                "style",
                `background: url(assets/images/buildings/${tower}.png);` +
                "background-size: 45px 45px;" +
                `height: ${rows * 45}px;` +
                `width: ${(rows > 1 ? 10 : number) * 45}px;` +
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
                        display.shop.header.innerHTML = towers[tower].name
                        display.shop.rate.innerHTML = towers[tower].base_rate
                        display.shop.click.innerHTML = towers[tower].base_click
                        shop.active = tower

                        display.shop.owned.innerHTML = game.towers[shop.active][0]
                        display.shop.producing.innerHTML = nice_format(game.towers[shop.active][1].toFixed(2))

                        game_worker.postMessage(["update_costs", shop])
                    }
                }

                link.addEventListener("click", eventHandler(tower))

                if (tower == "autoclicker") link.click()

                link.href = "#"
                link.innerHTML = towers[tower].name
                listing.appendChild(link)
                display.shop.listings.appendChild(listing)
            }

            display.shop.radio[0].click()
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

                if (count > 9)
                    container.appendChild(graphics.create_row(tower, Math.floor(count / 10) * 10))

                if (count % 10 > 0)
                    container.appendChild(graphics.create_row(tower, count % 10))

                fieldset.setAttribute("style", "border: 1px solid black;")
                fieldset.appendChild(legend)
                fieldset.appendChild(container)

                windows[2].appendChild(fieldset)
            }
        },
        goldenkhoi: () => {
            let khoi = document.createElement("div")
            khoi.setAttribute("id", "goldenkhoi")
            khoi.setAttribute("style",
                `top:${Math.ceil(Math.random() * 70) + 15}%;` +
                `left:${Math.ceil(Math.random() * 70) + 15}%;`
            )

            khoi.addEventListener("click", () => {
                game_worker.postMessage(["goldenkhoi"])
                try { document.body.removeChild(khoi) } catch (_) {}

                for (let window of windows)
                    if (window != null)
                        window.parentElement.classList.add("khoi")
                document.getElementById("background").classList.add("khoi")
            })

            setTimeout(() => {
                try { document.body.removeChild(khoi) } catch (_) {}
            }, 25000)

            document.body.appendChild(khoi)
        },
        update_shop: (data) => { shop = data }
    }

    const towers = {
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
        water: {
            name: "gamer girl water",
            base_cost: 100000,
            cost_multiplier: 1.015,
            base_rate: 200,
            base_click: 0,
        }
    }

    const display = {
        rate: document.getElementById("cps"),
        total: document.getElementById("counter"),
        button: document.getElementById("kfc"),
        shop: {
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
            producing: document.getElementById("stats-producing"),
            listings: document.getElementById("listings"),
        }
    }

    let game = {
        towers: {
            autoclicker: [0,0],
            stream: [0,0],
            coomfactory: [0,0],
            dogfarm: [0,0],
            water: [0,0],
        },
        modifiers: {
            click: [0,0],
            offline: [0,0],
            autoclicker: [0,0],
            stream: [0,0],
            coomfactory: [0,0],
            dogfarm: [0,0],
            water: [0,0],
        },
        gamergoo: 0.0,
        gamergoo_history: 0.0,
        rate: 0.0,
        last_save: Date.now()
    }

    let shop = {
        active: "autoclicker",
        active_amount: 1,
        active_cost: 1,
        active_refund: 1,
    }

    const functions = {
        update_goo: (data) => {
            // Update goo counter and history
            game.gamergoo = data[0]
            game.gamergoo_history = data[1]

            display.total.innerHTML = nice_format(Math.round(game.gamergoo))
        },
        click: (data) => {
            // Click graphics assuming successful click
            graphics.floater(Math.round(data[2] * 100) / 100, data[0], data[1])
            graphics.bounce()
        },
        update_graphics: (data) => {
            // Update clicker graphics
            if (!data.length) return

            for (let message of data[0]) {
                switch (message) {
                    case "buttons":
                        if (shop.active_cost > game.gamergoo)
                            display.shop.buy.setAttribute("disabled", "disabled")
                        else
                            display.shop.buy.removeAttribute("disabled")
                        break
                    case "title":
                        document.title = nice_format(Math.round(game.gamergoo)) + " gamergoo | Khoima Clicker"
                        break
                    case "listings":
                        graphics.update_buildings()

                        display.shop.owned.innerHTML = game.towers[shop.active][0]
                        display.shop.producing.innerHTML = nice_format(game.towers[shop.active][1].toFixed(2))
                        break
                    case "rate":
                        display.rate.innerHTML = nice_format(data[1]) + " gamergoo per second"
                        display.shop.producing.innerHTML = nice_format(game.towers[shop.active][1].toFixed(2))
                        break
                    case "shop":
                        shop = data[1]
                        if (shop.active_cost > game.gamergoo)
                            display.shop.buy.setAttribute("disabled", "disabled")
                        else
                            display.shop.buy.removeAttribute("disabled")

                        if (shop.active_amount > game.towers[shop.active][0]) {
                            display.shop.sell.setAttribute("disabled", "disabled")
                            display.shop.refundcontainer.setAttribute("style", "visibility:hidden;")
                        } else {
                            display.shop.sell.removeAttribute("disabled")
                            display.shop.refundcontainer.removeAttribute("style")
                        }

                        display.shop.cost.innerHTML = nice_format(shop.active_cost)
                        display.shop.refund.innerHTML = nice_format(shop.active_refund)
                        break
                    default:
                        break
                }
            }
        },
        save: (data) => {
            // Sync worker gamestate with main thread, and save state to localstorage

            if (data)
                game = data[0]

            if (game != undefined) {
                game.last_save = Date.now()
                window.localStorage["gamestate"] = window.btoa(JSON.stringify(game))
            } else {
                window.localStorage.removeItem("gamestate")
                window.location.reload()
            }
        },
        goldenkhoi: () => {
            // Spawn golden khoi
            graphics.goldenkhoi()
        },
        goldenkhoi_end: () => {
            for (let window of windows)
                if (window != null)
                    window.parentElement.classList.remove("khoi")
            document.getElementById("background").classList.remove("khoi")
        }
    }

    function setup() {
        if (window.localStorage["gamestate"] == undefined) functions.save()

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

        display.button.addEventListener("mousedown", e => {
            game_worker.postMessage(["click", [e.clientX, e.clientY]])
        })

        document.addEventListener("click", () => {
            game_worker.postMessage(["interact"])
        })

        game_worker.postMessage([
            "setup",
            [ game, towers, shop ]
        ])

        graphics.create_shop()
        graphics.update_buildings()

        game_worker.onmessage = e => {
            if (functions.hasOwnProperty(e.data[0]))
                functions[e.data[0]](e.data[1])
        }
    }

    // Exports
    return {
        start: () => {
            running = true
            // Setup save file, graphics, and sync with worker thread
            setup()
        },
        shop_count: e => {
            shop.active_amount = parseInt(e.value)
            //game_worker.postMessage(["update_costs", shop])
        },
        shop: (action) => {
            game_worker.postMessage(["shop", [action, shop]])
        },
        stats: () => {
            console.log(
                "gamergoo: " + game.gamergoo + '\n' +
                "total gamergoo: " + game.gamergoo_history + '\n'
            )
        },
        worker: game_worker
    }
})()

game.start()