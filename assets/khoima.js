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

let game = (() => {
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
            base_cost: 15,
            cost_multiplier: 1.0145,
            base_rate: .35,
            base_click: 0,
        },
        coomfactory: {
            name: "coom factory",
            base_cost: 850,
            cost_multiplier: 1.017,
            base_rate: 35,
            base_click: 0,
        },
        dogfarm: {
            name: "dog farm",
            base_cost: 8500,
            cost_multiplier: 1.013,
            base_rate: 125,
            base_click: 0,
        }
    }

    let display = {
        rate: document.getElementById("cps"),
        total: document.getElementById("counter"),
        button: document.getElementById("kfc")
    }

    let game = {
        towers: {
            autoclicker: [0, 0],
            coomfactory: [0, 0],
            dogfarm: [0, 0]
        },
        modifiers: {
            click: [0,0],
            offline: [0,0],
            autoclicker: [0,0],
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

    function add_goo(amt) {
        game.gamergoo += amt
        if (amt > 0)
            game.gamergoo_history += amt
        display.total.innerHTML = nice_format(Math.round(game.gamergoo))

        save()
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

    function setup() {
        if (window.localStorage["gamestate"] === undefined)
            save()

        game = JSON.parse(window.atob(window.localStorage["gamestate"]))

        if (game.last_save === undefined)
            game.last_save = Date.now()

        if (game.save_version === undefined) {
            game.modifiers = {
                click: [0,0],
                offline: [0,0],
                autoclicker: [0,0],
                coomfactory: [0,0],
                dogfarm: [0,0],
            }
            game.save_version = 2
        }

        create_shop()
    }

    function update_costs() {
        let tower = towers[shop.active]

        // Geometric Partial Sum
        shop.active_cost = Math.ceil(
            (tower.base_cost * tower.cost_multiplier ** game.towers[shop.active][0])* (
            (1 - tower.cost_multiplier ** shop.active_amount)
            / (1 - tower.cost_multiplier)
        ))

        shop.stats.cost.innerHTML = nice_format(shop.active_cost)
    }

    function update_rates() {
        game.rate = 0

        for (tower in game.towers) {
            let rate = game.towers[tower][0] * towers[tower].base_rate
            game.towers[tower][1] = rate
            game.rate += rate
        }

        display.rate.innerHTML = nice_format(game.rate.toFixed(2)) + " gamergoo per second"
    }

    function loop() {
        let now = Date.now()
        if (now - game.last_save >= 50)
            add_goo(game.rate / 20)

        window.requestAnimationFrame(loop)
    }

    // exports
    return {
        start: () => {
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

                shop.stats.owned.innerHTML = game.towers[shop.active][0]
                shop.stats.producing.innerHTML = game.towers[shop.active][1]

                save()
            }
        },
        stats: () => {
            console.log(game.gamergoo)
            console.log(game.gamergoo_history)
        }
    }
})()

game.start()