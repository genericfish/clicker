let Flappy = (() => {
    // Keep these variables out of class scope to make it slightly harder to cheat
    let score = 0,
        gravity = 825,
        divisor = 2,
        pipe_speed = 100,
        pipe_gap = 120

    class Character {
        constructor (win) {
            this.win = win
            this.canvas = this.win.get("flappy")
            this.context = this.canvas.getContext('2d')

            this.canvas.width = 400
            this.canvas.height = 650

            this.context.fillStyle = "#0f0"

            this.animations = {
                default: [
                    0x3FE0, 0x4010, 0x8010, 0x887F,
                    0x10041, 0x1007F, 0x10044, 0x1007C,
                    0x10008, 0x11408, 0x31408, 0x10808,
                    0x10008, 0x8010, 0x7FE0, 0xE070,
                ],
                wingup: [
                    0b010001110000001000,
                    0b110000000000001000,
                    0b010000000000001000,
                ],
                blink: 0b001000000001111111
            }

            this.status = {
                "WING_UP": false,
                "BLINK": false
            }

            this.reset()
        }

        reset = _ => {
            this.pos = [60, this.canvas.height / 2 - 24, 0]
            this.velo = 0
        }

        draw = _ => {
            this.context.resetTransform()
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

            let char = [].concat(this.animations.default)

            if (this.status.WING_UP)
                [char[9], char[10], char[11]] = this.animations.wingup

            if (this.status.BLINK)
                char[3] = this.animations.blink

            this.context.translate(~~(this.pos[0]) + 18, ~~(this.pos[1]) + 16)
            this.context.rotate(this.pos[2] * Math.PI / 180)

            for (let num in char)
                for (let bit = 0; bit < 18; bit++)
                    if (char[num] << bit & 0x20000)
                        this.context.fillRect(2 * (bit - 8), 2 * (num - 7), 2, 2)
        }

        physics = delta => {
            this.velo += gravity * delta / 1000
            this.pos[1] += this.velo * delta / 1000

            if (this.pos[2] < 55)
                this.pos[2]++

            if (this.pos[2] >= -37)
                this.status.BLINK = false

            if (this.pos[2] >= -10)
                this.status.WING_UP = false
        }

        jump = _ => {
            this.velo = -gravity / divisor
            this.pos[2] = -45
            this.status.WING_UP = true
            this.status.BLINK = true
        }
    }

    class Pipes {
        constructor (win) {
            this.win = win
            this.canvas = this.win.get("pipes")
            this.context = this.canvas.getContext("2d")

            this.canvas.width = 400
            this.canvas.height = 650

            this.context.strokeStyle = "#f00"
            this.context.lineWidth = 3

            this.reset()
        }

        reset = () => {
            this.pipes = [
                // pos[0] represents left most point of pipe
                // pos[1] represents center of gap in pipe
                [350, random(100, 550)],
                [650, random(100, 550)],
                [950, random(100, 550)],
            ]

            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        }

        draw = () => {
            this.context.resetTransform()
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

            for (let pipe of this.pipes) {
                let [x, y] = pipe

                this.context.strokeRect(x, -650, 45, y - pipe_gap / 2 + 650)
                this.context.strokeRect(x, y + pipe_gap / 2, 45, 650)
            }
        }

        physics = delta => {
            for (let pipe of this.pipes)
                pipe[0] -= pipe_speed * delta / 1000

            this.pipes = this.pipes.filter(pipe => pipe[0] > -50)

            if (this.pipes.length < 3)
                this.pipes.push([
                    this.pipes[this.pipes.length - 1][0] + 300,
                    random(100, 550)
                ])
        }
    }

    class HUD {
        constructor (win) {
            this.win = win
            this.canvas = this.win.get("hud")
            this.context = this.canvas.getContext("2d")

            this.canvas.width = 400
            this.canvas.height = 650

            this.context.fillStyle = "#0ff"
            this.context.font = "25px VT323"
            this.context.fillText("score: 0", 10, 20)
        }

        draw(text, blank = false, x = -1, y = -1) {
            if (blank)
                this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

            if (x == -1) {
                x = this.canvas.width / 2
                this.context.textAlign = "center"
            } else this.context.textAlign = "left"

            if (y == -1) {
                y = this.canvas.height / 2
                this.context.textBaseline = "middle"
            } else this.context.textBaseline = "alphabetic"

            this.context.fillText(text, x, y)
        }
    }

    class Flappy {
        constructor () {
            this.win = H.WM.get("flappykhoi")

            H.WM.add_hook("exit", this.win.id, this.exit)
            H.WM.add_hook("maximize", this.win.id, this.maximize)

            this.char = new Character(this.win)
            this.hud = new HUD(this.win)
            this.pipes = new Pipes(this.win)

            this.game_over = false
            this.running = this.win.s == 0
            this.loop()

            this.char.canvas.addEventListener("mousedown", this.mousedown)
            this.char.canvas.addEventListener("touchstart", this.mousedown)

            this.last = performance.now()
        }

        restart = () => {
            this.hud.draw("score: 0", true, 10, 20)
            this.pipes.reset()
            this.char.reset()

            score = 0

            this.game_over = false
            setTimeout(_ => {
                this.last = performance.now()
                this.loop()
            }, 100)
        }

        mousedown = () => {
            if (this.game_over)
                this.restart()
            else
                this.char.jump()
        }

        exit = () => { this.running = false }

        maximize = () => {
            setTimeout(_ => {
                if (!this.running) {
                    this.running = true
                    this.loop()
                }
            }, 650)
        }

        owned = () => {
            if (!game.get("minigames").flappybird) {
                this.hud.context.fillStyle = "#000"
                this.hud.context.fillRect(
                    0,
                    this.hud.canvas.height / 2 - 40,
                    this.hud.canvas.width,
                    100
                )

                this.hud.context.strokeStyle = "#00f"
                this.hud.context.lineWidth = 2
                this.hud.context.strokeRect(
                    0,
                    this.hud.canvas.height / 2 - 40,
                    this.hud.canvas.width,
                    100
                )

                this.hud.context.fillStyle = "#0ff"
                this.hud.draw("you must purchase this game from")
                this.hud.draw("the shop for 5000 gamergoo", false,
                    -1,
                    this.hud.canvas.height / 2 + 25
                )

                return false
            }

            return true
        }

        loop = () => {
            let now = performance.now()
            let delta = now - (this.last || now)

            this.char.draw()
            this.pipes.draw()

            if (!this.owned()) return

            this.char.physics(delta)
            this.pipes.physics(delta)

            // Add points if player has cleared the left most pipe
            let left = this.pipes.pipes[0]
            if (left[0] < 10 && left[2] == undefined) {
                this.pipes.pipes[0].push(true)
                this.hud.draw("score: " + ++score, true, 10, 20)
            }

            // Check if player goes out of bounds
            if (this.char.pos[1] > 750 || this.char.pos[1] < -100)
                this.game_over = true

            // Check collision
            // * Player position is the centre of the character model
            // * while pipe position in x axis is the left most point
            // * and in the y axis the middle of the gap
            // Ignore player rotation in these calculations, and use
            // a static square around the center of the player model
            if (left[0] < 78 && left[0] > 20) {
                // Use 78 because player is centred at x=60, and
                // player is drawn upto 18 pixels to the right.
                this.game_over |=
                    this.char.pos[1] > left[1] + pipe_gap / 2 - 16||
                    this.char.pos[1] < left[1] - pipe_gap / 2
            }

            if (!this.game_over && this.running)
                window.requestAnimationFrame(this.loop)
            else if (this.game_over)
                game_over()

            this.last = now
        }
    }

    function game_over() {
        if (score >= 5) {
            // Give 10 minutes worth of gamergoo
            let gamergoo = game.get("rate") * (20 * 60)

            // Capped at 10% of currently owned gamergoo
            if (gamergoo > (game.get("gamergoo") * .1)) gamergoo = game.get("gamergoo") * .1

            // Regardless, give 10k gamergoo
            gamergoo = Math.max(10000, gamergoo) || 10000

            // Multiplier based on score
            gamergoo *= score / 12

            H.FP.hud.draw("loss")
            H.FP.hud.draw(`+${nice_format(Math.trunc(gamergoo))} gamergoo`, false,
                -1,
                H.FP.hud.canvas.height / 2 + 25
            )

            game.worker(["add", [gamergoo, true]])
        } else
            H.FP.hud.draw("loser.")
    }

    return _ => { H.FP = new Flappy() }
})()