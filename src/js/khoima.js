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
    // TODO: Rework minesweeper so we can get rid of this flag
    let ms_flag = false

    const game_worker =
        typeof(SharedWorker) !== "undefined" ? new SharedWorker("assets/js/workers/clicker.js") :
        typeof(Worker) !== "undefined" ? new Worker("assets/js/workers/clicker.js") :
        null // FIXME: Handle no worker found

    let postMessage =
        typeof(SharedWorker) !== "undefined" ? msg => { game_worker.port.postMessage(msg) } :
        typeof(Worker) !== "undefined" ? msg => { game_worker.postMessage(msg) } :
        _ => {}

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

            let box = H.WM.get("khoima clicker").win.getBoundingClientRect()

            container.style.position = "absolute"
            container.style.top = (y - box.top) + "px"
            container.style.left = (x - Math.floor(box.left * 1.5)) + "px"
            container.style.pointerEvents = "none"
            container.style.zIndex = 4

            display.innerHTML = `+${amount}`

            H.WM.get("khoima clicker").body.appendChild(container)

            setTimeout(() => { H.WM.get("khoima clicker").body.removeChild(container) }, 1000)
        },
        create_row: (tower, number) => {
            let row = document.createElement("div")
            let rows = Math.max(Math.floor(number / 10), 1)

            row.style.background = `url(assets/images/buildings/${tower}.png)`
            row.style.backgroundSize = "42px 42px"
            row.style.height = rows * 42 + "px"
            row.style.width = (rows > 1 ? 10 : number) * 42 + "px"
            row.style.margin = "0 auto"

            return row
        },
        create_shop: () => {
            for (let tower in towers) {
                let listing = document.createElement("li")
                let link = document.createElement("a")

                let eventHandler = tower => () => {
                    shop.minigame = false

                    display.shop.header.innerHTML =
                        towers[tower].name + " stats"
                    display.shop.rate.innerHTML =
                        "gamergoo per second: +" + towers[tower].base_rate
                    display.shop.click.innerHTML =
                        "gamergoo per click: +" + towers[tower].base_click
                    shop.active = tower

                    if (towers[tower].hasOwnProperty("desc"))
                        display.shop.desc.innerHTML = towers[tower].desc
                    else
                        display.shop.desc.innerHTML = ""

                    display.shop.owned.innerHTML =
                        game.towers[shop.active][0] + " currently owned"
                    display.shop.producing.innerHTML =
                        "producing " +
                        nice_format(game.towers[shop.active][1].toFixed(2)) +
                        " gamergoo per second"

                    display.shop.select.style.visibility = "visible"

                    postMessage(["update_costs", shop])
                }

                link.addEventListener("click", eventHandler(tower))

                if (tower == "autoclicker") link.click()

                link.href = "#"
                link.innerHTML = towers[tower].name
                listing.appendChild(link)
                display.shop.listings.appendChild(listing)
            }

            for (let minigame in minigames) {
                let listing = document.createElement("li")
                let link = document.createElement("a")

                let eventHandler = minigame => () => {
                    shop.minigame = true

                    display.shop.header.innerHTML = minigames[minigame].name
                    display.shop.desc.innerHTML = minigames[minigame].desc
                    display.shop.rate.innerHTML = ""
                    display.shop.click.innerHTML = ""

                    shop.active = minigame

                    display.shop.owned.innerHTML = game.minigames[minigame] ?
                        "You already own " + minigames[minigame].name :
                        "Purchase now!"
                    display.shop.producing.innerHTML = ""

                    display.shop.select.style.visibility = "hidden"

                    postMessage(["update_costs", shop])
                }

                link.addEventListener("click", eventHandler(minigame))

                link.href = "#"
                link.innerHTML = minigames[minigame].name
                listing.appendChild(link)
                display.shop.minigames.appendChild(listing)
            }

            display.shop.radio[0].click()
        },
        update_buildings: () => {
            H.WM.get("buildings").body.innerHTML = ""

            let has_towers = false
            let fs_container = document.createElement("div")

            fs_container.style.maxHeight = "500px"
            fs_container.style.overflowY = "scroll"

            for (let tower in towers) {
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

                fieldset.style.border = "1px solid black"
                fieldset.appendChild(legend)
                fieldset.appendChild(container)

                fs_container.appendChild(fieldset)
                has_towers = true
            }

            if (!has_towers)
                H.WM.get("buildings").body.innerHTML = "Purchase buildings for them to appear here."
            else
                H.WM.get("buildings").body.appendChild(fs_container)
        },
        goldenkhoi: () => {
            let khoi = document.createElement("div")
            khoi.id = "goldenkhoi"
            khoi.style.top = random(15, 70) + '%'
            khoi.style.left = random(15, 70) + '%'

            khoi.addEventListener("click", () => {
                postMessage(["goldenkhoi"])

                try { document.body.removeChild(khoi) } catch (_) {}

                H.WM.get("khoima clicker").win.classList.add("khoi")
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
            modifiers: {
                "wallhack": [500, 1.5],
                "aimlock": [5000, 1.5],
                "spinbot": [15000, 2]
            }
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
        minesweeper: {
            // For legacy purposes, this tower is called "minesweeper" because
            // it used to be that this tower unlocked the khoisweeper minigame
            // this is no longer the case, however, we cannot easily rename the
            // tower internally, so the external name is now "khoi pond"

            name: "khoi pond",
            base_cost: 5000,
            cost_multiplier: 1.015,
            base_rate: 20,
            base_click: 0
        },
        dogfarm: {
            name: "dog farm",
            base_cost: 10000,
            cost_multiplier: 1.015,
            base_rate: 75,
            base_click: 0,
        },
        water: {
            name: "gamer girl water",
            base_cost: 100000,
            cost_multiplier: 1.015,
            base_rate: 225,
            base_click: 0,
        },
        ghoti: {
            name: "generic ghoti",
            base_cost: 500000,
            cost_multiplier: 1.015,
            base_rate: 500,
            base_click: 0
        }
    }

    const minigames = {
        minesweeper: {
            name: "khoisweeper",
            desc: "a description for khoisweeper",
            base_cost: 5000
        },
        shenzhen: {
            name: "shenzhen solitaire",
            desc: "<b>THERE IS NO REWARD FOR WINNING SHENZHEN SOLITAIRE AT THIS MOMENT</b>",
            base_cost: 10000
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
            minigames: document.getElementById("minigames"),
            select: document.getElementById("shop-select"),
            desc: document.getElementById("stats-desc")
        }
    }

    let game = {
        towers: {
            autoclicker: [0,0],
            stream: [0,0],
            coomfactory: [0,0],
            minesweeper: [0,0],
            dogfarm: [0,0],
            water: [0,0],
            ghoti: [0,0],
        },
        modifiers: {
            click: [0,0],
            offline: [0,0],
            autoclicker: [0,0],
            stream: [0,0],
            coomfactory: [0,0],
            minesweeper: [0,0],
            dogfarm: [0,0],
            water: [0,0],
            ghoti: [0,0],
        },
        minigames: {
            minesweeper: false,
            shenzhen: false
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
        minigame: false
    }

    const functions = {
        update_goo: (data) => {
            // Update goo counter and history
            game.gamergoo = data[0]
            game.gamergoo_history = data[1]

            display.total.innerHTML = nice_format(Math.trunc(game.gamergoo))
        },
        click: (data) => {
            // Click graphics assuming successful click
            graphics.floater(Math.trunc((data[2] * 100) / 100), data[0], data[1])
            graphics.bounce()
        },
        update_graphics: (data) => {
            // Update clicker graphics
            if (!data.length) return

            for (let message of data[0]) {
                switch (message) {
                    case "buttons":

                        if (shop.minigame) {
                            if (game.minigames[shop.active] || shop.active_cost > game.gamergoo)
                                display.shop.buy.setAttribute("disabled", "disabled")
                            else
                                display.shop.buy.removeAttribute("disabled")
                        } else {
                            if (shop.active_cost > game.gamergoo)
                                display.shop.buy.setAttribute("disabled", "disabled")
                            else
                                display.shop.buy.removeAttribute("disabled")
                        }

                        break
                    case "title":
                        document.title = nice_format(Math.trunc(game.gamergoo)) + " gamergoo | Khoima Clicker"
                        break
                    case "listings":
                        graphics.update_buildings()

                        if (shop.minigame) {
                            display.shop.owned.innerHTML = game.minigames[shop.active] ?
                                "You already own " + minigames[shop.active].name :
                                "Purchase now!"
                            display.shop.producing.innerHTML = ""
                        } else {
                            display.shop.owned.innerHTML =
                                game.towers[shop.active][0] + " currently owned"
                            display.shop.producing.innerHTML =
                                "producing " +
                                nice_format(game.towers[shop.active][1].toFixed(2)) +
                                " gamergoo per second"
                        }
                        break
                    case "rate":
                        display.rate.innerHTML = nice_format(data[1]) + " gamergoo per second"

                        if (!shop.minigame)
                            display.shop.producing.innerHTML =
                                nice_format(game.towers[shop.active][1].toFixed(2))
                        break
                    case "shop":
                        shop = data[1]
                        if (shop.active_cost > game.gamergoo)
                            display.shop.buy.setAttribute("disabled", "disabled")
                        else
                            display.shop.buy.removeAttribute("disabled")

                        if (shop.minigame) {
                            display.shop.refundcontainer.style.visibility = "hidden"
                        } else if (shop.active_amount > game.towers[shop.active][0]) {
                            display.shop.sell.setAttribute("disabled", "disabled")
                            display.shop.refundcontainer.style.visibility = "hidden"
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
        goldenkhoi: () => { /** Spawn golden khoi */ graphics.goldenkhoi() },
        goldenkhoi_end: () => { H.WM.get("khoima clicker").win.classList.remove("khoi") },
        minigame_purchase: minigame => {
            setTimeout(_ => {
                switch (minigame) {
                    case "minesweeper":
                        ms.generate(-1)
                        break
                    case "shenzhen":
                        H.SH.restart()
                        break
                }
            }, 15)
        }
    }

    function setup() {
        if (window.localStorage["gamestate"] == undefined) functions.save()

        let game_load = JSON.parse(window.atob(window.localStorage["gamestate"]))

        if (game.last_save === undefined)
            game.last_save = Date.now()

        // Copy first level nested objects
        for (let key in game)
            if (game_load.hasOwnProperty(key))
                if (game[key] instanceof Object)
                    game[key] = Object.assign(game[key], game_load[key])
                else
                    game[key] = game_load[key]

        display.button.addEventListener("mousedown", e =>
            postMessage(["click", [e.clientX, e.clientY]])
        )

        document.addEventListener("click", _ => postMessage(["interact"]))

        postMessage([
            "setup",
            [ game, towers, shop, minigames ]
        ])

        graphics.create_shop()
        graphics.update_buildings()

        if (typeof(SharedWorker) !== "undefined") {
            game_worker.port.onmessage = e => {
                if (functions.hasOwnProperty(e.data[0]))
                    functions[e.data[0]](e.data[1])
            }
        } else if (typeof(Worker) !== "undefined") {
            game_worker.onmessage = e => {
                if (functions.hasOwnProperty(e.data[0]))
                    functions[e.data[0]](e.data[1])
            }
        }
    }

    // Exports
    return {
        start: () => {
            // Setup save file, graphics, and sync with worker thread
            setup()
        },
        shop_count: e => {
            shop.active_amount = parseInt(e.value)
            postMessage(["update_costs", shop])
        },
        shop: action => postMessage(["shop", [action, shop]]),
        stats: () => {
            console.log(
                "gamergoo: " + game.gamergoo + '\n' +
                "total gamergoo: " + game.gamergoo_history + '\n'
            )
        },
        get: item => {
            if (game.hasOwnProperty(item))
                return game[item]
        },
        worker: game_worker,
    }
})()

game.start()
