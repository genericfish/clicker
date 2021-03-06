let active = 0

let game = (() => {
    let game, towers, shop, minigames
    let game_state = {
        last_click: undefined,
        golden_khoi: false,
        golden_khoi_frame: undefined,
        last_interaction: undefined,
        paused: false
    }

    function add_goo(amt, add) {
        add = add === undefined

        game.gamergoo += parseFloat(amt)

        if (amt > 0 && add)
            game.gamergoo_history += amt

        postAll(["update_goo", [game.gamergoo, game.gamergoo_history]])
    }

    function update_rates() {
        game.rate = 0

        for (let tower in towers) {
            let rate = game.towers[tower][0] * towers[tower].base_rate
            game.towers[tower][1] = rate
            game.rate += rate
        }

        postAll(["update_graphics", [["rate"], game.rate]])
        save()
    }

    function geometric_sum(base, ratio, exp) {
        // Geometric Partial Sum
        return Math.trunc(base * (1 - ratio ** exp) / (1 - ratio))
    }

    function update_costs() {
        if (shop.mode == "minigames") {
            let minigame = minigames[shop.active]

            shop.active_cost = parseInt(minigame.base_cost)
        } else {
            let tower = towers[shop.active]

            shop.active_cost = geometric_sum(
                tower.base_cost * tower.cost_multiplier ** game.towers[shop.active][0],
                tower.cost_multiplier,
                shop.active_amount
            )
    
            // Refund 85% of the buy price.
            shop.active_refund = Math.trunc(
                geometric_sum(
                    tower.base_cost * tower.cost_multiplier **
                        (game.towers[shop.active][0] - shop.active_amount),
                    tower.cost_multiplier,
                    shop.active_amount
                ) * .85
            )
        }

        postAll(["update_graphics", [["shop", "listings"], shop]])
    }

    function save(instance) {
        // Do not send "save" to all instances, concurrency issues will occur
        post(["save", [game]], instance || active)
    }

    let loop = ((instance) => {
        let last_frame = Date.now()
        let frames = 0
        let last_updates = [0,0,0]

        return () => {
            if (game_state.paused) return

            let now = Date.now()

            // Approximately 50 FPS
            if (now - last_frame >= 20)
                frames += Math.round((now - last_frame) / 20)

            // Every 15th frame (~300ms) update shop buy button
            if (frames - last_updates[1] >= 15) {
                postAll(["update_graphics", [["buttons", "title"]]])
                last_updates[1] = frames
            }

            // Only execute these functions on the main loop, otherwise duplication will occur
            if (active == instance) {
                // Every other frame (~40ms)
                if (frames - last_updates[0] >= 2) {
                    last_updates[0] = frames

                    // Add 1/25th of goo every other frame
                    let goo = game.rate / 25

                    // After 5 minutes of no clicking, only give 15% of rate
                    if (now - game_state.last_interaction > 300000) goo *= .15

                    add_goo(goo)
                }

                // Save game every 1.2 seconds (60 frames)
                if (frames - last_updates[2] >= 60) {
                    save()
                    last_updates[2] = frames
                }

                // Spawn goldenkhoi
                if (frames >= game_state.golden_khoi_frame) {
                    game_state.golden_khoi_frame = frames + random(1500, 30000)
                    postAll(["goldenkhoi"])
                }
            }

            last_frame = now
        }
    })

    return {
        setup: (data, instance) => {
            // Sync gamestate and towers with main thread
            ({0: game, 1: towers, 2: shop, 3: minigames} = data)

            // Some saves were broken in 1.4.0 patch
            if (game.gamergoo == NaN)
                game.gamergoo = 0
            if  (game.gamergoo_history == NaN)
                game.gamergoo_history = 0

            // Initialize non static game states
            game_state.last_click = Date.now()
            game_state.last_interaction = Date.now()
            game_state.golden_khoi = false
            game_state.golden_khoi_frame = random(1500, 30000)

            // Update rates then give user gamergoo based on last save
            update_rates()

            let elapsed_time = (Date.now() - game.last_save) / 1000

            // Maximum offline time is 8 hours
            elapsed_time = (elapsed_time < (8 * 60 * 60)) ? elapsed_time : 8 * 60 * 60

            // Earn goo at a rate of 0.85% of normal rate
            let offline_goo = game.rate * 0.0085 * elapsed_time
            add_goo(offline_goo)

            // Start game loop
            setInterval(loop(instance), 20)
        },
        click: (data) => {
            let now = Date.now()

            // Limit click speed to 95ms between each
            if (now - game_state.last_click <= 95) return

            // Calculate amount to add
            let amount = game.modifiers.click[0] + 1

            if (game_state.golden_khoi)
                amount += Math.max(game.rate * .2, 5)

            amount += game.rate * .075

            // Reset click timer
            game_state.last_click = now

            add_goo(amount)

            // Put amount added to use in floaters
            data.push(amount)
            postAll(["click", data])
        },
        shop: (data) => {
            // Handle buying and selling
            let action = data[0]
            let update = false

            shop = data[1]

            if (shop.mode == "minigames") {
                if (action != "buy") return

                if (!game.minigames[shop.active] && game.gamergoo >= shop.active_cost) {
                    add_goo(-shop.active_cost, false)
                    game.minigames[shop.active] = true

                    update = true

                    postAll(["minigame_purchase", shop.active])
                }
            } else {
                if (action == "buy" && game.gamergoo >= shop.active_cost) {
                    add_goo(-shop.active_cost, false)
                    game.towers[shop.active][0] += shop.active_amount
    
                    update = true
                } else if (action == "sell" && game.towers[shop.active][0] >= shop.active_amount) {
                    add_goo(shop.active_refund, false)
                    game.towers[shop.active][0] -= shop.active_amount
    
                    update = true
                }
            }

            if (update) {
                // Update if number of towers has changed
                save()
                update_rates()
                update_costs()
                postAll(["update_graphics", [["listings"]]])
            }
        },
        interact: (_, instance) => {
            // User has interacted with the page via click
            game_state.last_interaction = Date.now()
            active = instance
        },
        goldenkhoi: () => {
            // User has clicked the golden khoi
            game_state.golden_khoi = true

            setTimeout(() => {
                game_state.golden_khoi = false
                postAll(["goldenkhoi_end"])
            }, 12500)
        },
        update_costs: (data) => {
            shop = data
            update_costs()
        },
        hack: (data) => { add_goo(data, false) },
        add: add_goo,
        pause: () => { game_state.paused = !game_state.paused },
        wipe: () => {
            game_state.paused = true
            game = undefined
            save()
        },
        load: (data) => {
            game = JSON.parse(atob(data))
            update_rates()
            update_costs()
            save()
        },
        postMessage: (data) => { postAll(data) },
        post: (data, instance) => { post(data, instance) },
    }
})()

let instances = []
let postAll, post

if (typeof(onconnect) !== "undefined") {
    // SharedWorker
    onconnect = e => {
        let port = e.ports[0]

        instances.push(port)

        let instance = instances.length - 1

        // Presumably, the last open tab will be the active one (at the moment its created)
        active = instance

        // Listen from input from all instances
        port.onmessage = e => {
            if (game.hasOwnProperty(e.data[0]))
                game[e.data[0]](e.data[1], instance)
        }
    }

    // Post message to all connected instances
    postAll = (data) => { for (let instance of instances) instance.postMessage(data) }

    // Post message to specific instance
    post = (data, instance) => { instances[instance].postMessage(data) }
} else {
    // Worker
    onmessage = e => {
        if (game.hasOwnProperty(e.data[0]))
            game[e.data[0]](e.data[1])
    }

    postAll = (data) => { postMessage(data) }
    post = (data) => { postMessage(data) }
}