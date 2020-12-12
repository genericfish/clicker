let game = (() => {
    let game, towers, shop;
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

        postMessage(["update_goo", [game.gamergoo, game.gamergoo_history]])
    }

    function update_rates() {
        game.rate = 0

        for (tower in towers) {
            let rate = game.towers[tower][0] * towers[tower].base_rate
            game.towers[tower][1] = rate
            game.rate += rate
        }

        postMessage(["update_graphics", [["rate"], game.rate]])
        save()
    }

    function geometric_sum(base, ratio, exp) {
        // Geometric Partial Sum
        return Math.ceil(
            base * (1 - ratio ** exp) / (1 - ratio)
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

        postMessage(["update_graphics", [["shop", "listings"], shop]])
    }

    function save() {
        postMessage(["save", [game]])
    }

    let loop = (() => {
        let last_frame = Date.now()
        let frames = 0
        let last_updates = [0,0,0]

        return () => {
            if (game_state.paused) return

            let now = Date.now()

            // Approximately 100 FPS
            if (now - last_frame >= 10)
                frames += Math.round((now - last_frame) / 10)

            // Every other frame (~20ms)
            if (frames - last_updates[0] >= 2) {
                last_updates[0] = frames

                // Add 1/50th of goo every other frame
                let goo = game.rate / 50

                // After 5 minutes of no clicking, only give 15% of rate
                if (now - game_state.last_click > 300000) goo *= .15

                add_goo(goo)
            }

            // Every 25th frame (~250ms) update shop buy button
            if (frames - last_updates[1] >= 25) {
                postMessage(["update_graphics", [["buttons", "title"]]])
                last_updates[1] = frames
            }

            // Save game every second (~100 frames)
            if (frames - last_updates[2] >= 100) {
                save()
                last_updates[2] = frames
            }

            // Spawn goldenkhoi
            if (frames >= game_state.golden_khoi_frame) {
                game_state.golden_khoi_frame = frames + Math.ceil((Math.random() * 15000) + 2000)
                postMessage(["goldenkhoi"])
            }

            last_frame = now
        }
    })

    return {
        setup: (data) => {
            // Sync gamestate and towers with main thread
            game = data[0]
            towers = data[1]
            shop = data[2]

            // Initialize non static game states
            game_state.last_click = Date.now()
            game_state.last_interaction = Date.now()
            game_state.golden_khoi = false
            game_state.golden_khoi_frame = Math.ceil((Math.random() * 15000) + 200)

            // Update rates then give user gamergoo based on last save
            update_rates()

            let elapsed_time = (Date.now() - game.last_save) / 1000

            // Maximum offline time is 8 hours
            elapsed_time = (elapsed_time < (8 * 60 * 60)) ? elapsed_time : 8 * 60 * 60

            // Earn goo at a rate of 0.85% of normal rate
            let offline_goo = game.rate * 0.0085 * elapsed_time
            add_goo(offline_goo)

            // Start game loop
            setInterval(loop(), 10)
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
            postMessage(["click", data])
        },
        shop: (data) => {
            // Handle buying and selling
            let action = data[0]
            let update = false

            shop = data[1]

            if (action == "buy" && game.gamergoo >= shop.active_cost) {
                add_goo(-shop.active_cost, false)
                game.towers[shop.active][0] += shop.active_amount

                update = true
            } else if (action == "sell" &&
                game.towers[shop.active][0] >= shop.active_amount
            ) {
                add_goo(shop.active_refund, false)
                game.towers[shop.active][0] -= shop.active_amount

                update = true
            }

            if (update) {
                // Update if number of towers has changed
                save()
                update_rates()
                update_costs()
                postMessage(["update_graphics", [["listings"]]])
            }
        },
        interact: () => {
            // User has interacted with the page via click
            game_state.last_interaction = Date.now()
        },
        goldenkhoi: () => {
            // User has clicked the golden khoi
            game_state.golden_khoi = true

            setTimeout(() => {
                game_state.golden_khoi = false
                postMessage(["goldenkhoi_end"])
            }, 12500)
        },
        update_costs: (data) => {
            shop = data
            update_costs()
        },
        hack: (data) => { add_goo(data, false) },
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
        }
    }
})()

onmessage = e => {
    if (game.hasOwnProperty(e.data[0]))
        game[e.data[0]](e.data[1])
}