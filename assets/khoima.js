(() => {
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
        gamergoo: 0.0,
        gamergoo_history: 0.0,
        rate: 0.0,
        last_save: Date.now()
    }
    
    let bounce = (() => {
        return () => {
            display.button.classList.add("clicked")
            setTimeout(() => {
                display.button.classList.remove("clicked")
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
    
    function save() {
        game.last_save = Date.now()
        window.localStorage["gamestate"] = window.btoa(JSON.stringify(game))
    }
    
    function add_goo(amt) {
        game.gamergoo += amt
        game.gamergoo_history += amt
        display.total.innerHTML = game.gamergoo.toFixed(2)
    
        save()
    }
    
    display.button.addEventListener("mousedown", e => {
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
            buy: document.getElementById("shop-buy"),
            owned: document.getElementById("stats-owned"),
            producing: document.getElementById("stats-producing")
        }
    }
    
    function shop_count(e) {
        shop.active_amount = parseInt(e.value)
        update_costs()
    }
    
    function update_costs() {
        let tower = towers[shop.active]
        shop.active_cost = 0
    
        for (let i = 0; i < (shop.active_amount + game.towers[shop.active][0]); i++)
            shop.active_cost += Math.ceil(
                tower.base_cost * (tower.cost_multiplier ** (i + game.towers[shop.active][0]))
            )
        shop.stats.cost.innerHTML = shop.active_cost
    }
    
    function update_rates() {
        game.rate = 0
    
        for (tower in game.towers) {
            let rate = game.towers[tower][0] * towers[tower].base_rate
            game.towers[tower][1] = rate
            game.rate += rate
        }
    
        display.rate.innerHTML = game.rate.toFixed(2) + " gamergoo per second"
    }
    
    function buy() {
        if (game.gamergoo >= shop.active_cost) {
            add_goo(-shop.active_cost)
            game.towers[shop.active][0] += shop.active_amount
    
            update_costs()
            update_rates()
    
            shop.stats.owned.innerHTML = game.towers[shop.active][0]
            shop.stats.producing.innerHTML = game.towers[shop.active][1]
    
            save()
        }
    }
    
    function main() {
        if (window.localStorage["gamestate"] === undefined)
            save()
    
        game = JSON.parse(window.atob(window.localStorage["gamestate"]))
    
        if (game.last_save === undefined)
            game.last_save = Date.now()
    
        display.total.innerHTML = game.gamergoo.toFixed(2)
    
        update_rates()
    
        add_goo(game.rate * ((Date.now() - game.last_save) / 1000))
    
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
                    shop.stats.producing.innerHTML = game.towers[shop.active][1]
    
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
    }
    
    let last = Date.now()
    
    function loop() {
        let now = Date.now()
        if (now - last >= 50) {
            last = now
    
            add_goo(game.rate)
        }
    
        window.requestAnimationFrame(loop)
    }
    
    main()
    loop()
})()