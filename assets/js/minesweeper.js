let ms = (() => {
    const ROWS = 14
    const COLS = 18
    const MAX_MINE = 40

    let board = document.getElementById("minesweeper")

    let game = {
        mines: undefined,
        board: undefined,
        flags: MAX_MINE,
        time: 0
    }

    let display = []
    let flags = document.getElementById("ms-flags")
    let time = document.getElementById("ms-time")
    let timer = undefined

    function get_neighbours(i) {
        let adj = [
            i - COLS - 1,
            i - COLS,
            i - COLS + 1,
            i - 1,
            i + 1,
            i + COLS - 1,
            i + COLS,
            i + COLS + 1
        ].map(x => x < 0 ? null : x >= (ROWS * COLS) ? null : x)

        if (i % COLS <= 0) {
            adj[0] = null
            adj[3] = null
            adj[5] = null
        }

        if (i % COLS == COLS - 1) {
            adj[2] = null
            adj[4] = null
            adj[7] = null
        }

        return adj
    }

    function generate(n) {
        n = n || 0

        game.mines = []
        game.board = new Array(COLS * ROWS).fill(0)

        if (n >= 0 && n <= COLS * ROWS) {
            for (let mine = 0; mine < MAX_MINE; mine++) {
                let spot = undefined
    
                while (spot == undefined || spot == n || game.mines.includes(spot))
                    spot = Math.floor(Math.random() * (COLS * ROWS - 1))
    
                game.board[spot] = -1
                game.mines.push(spot)
            }
        }

        setup()
    }

    function game_over() {
        clearInterval(timer)

        for (let mine of game.mines) {
            display[mine].style.color = "#f00"
            display[mine].innerHTML = "X"
        }
    }

    function flag(i) {
        return e => {
            e.preventDefault()

            if (game.board[i] == -2 || game.flags <= 0) return

            let html = e.target.innerHTML

            if (html != "F") {
                html = "F"
                game.flags--
            } else {
                html = "&nbsp;"
                game.flags++
            }

            e.target.innerHTML = html
            flags.innerHTML = game.flags
        }
    }

    function reveal(i) {
        if (!game.mines.length) generate(i)
        if (i == null || game.board[i] == -2) return
        if (game.board[i] == -1) return game_over()

        let val = game.board[i]
        let element = board.children[Math.floor(i / COLS)].children[i % COLS]

        if (val >= 0) {
            element.innerHTML = val == 0 ? "&nbsp;" : val
            element.classList.add("revealed")
            game.board[i] = -2
        }

        if (val != 0) return

        let adjacency = get_neighbours(i)

        reveal(adjacency[1])
        reveal(adjacency[3])
        reveal(adjacency[4])
        reveal(adjacency[6])
    }

    function press(i) {
        return () => {
            reveal(i)
            if (timer == undefined)
                timer = setInterval(() => {
                    game.time++
                    time.innerHTML = game.time
                }, 1000)
        }
    }

    function setup() {
        if (game.mines == undefined) return

        let make = !display.length
        let row = undefined

        clearInterval(timer)
        game.time = 0
        game.flags = MAX_MINE

        flags.innerHTML = game.flags
        time.innerHTML = 0

        if (!make)
            for (let e of display)
                e.className = ""
        else board.innerHTML = ""

        for (let i = 0; i < COLS * ROWS; i++) {
            if (i % COLS == 0 && make) {
                row = document.createElement("div")
                board.appendChild(row)
            }

            let cell = make ? document.createElement("button") : display[i]

            cell.innerHTML = "&nbsp;"
            cell.style.color = "#000"

            if (game.board[i] != -1) {
                let adjacent = 0

                for (let j of get_neighbours(i))
                    if (j == null) continue
                    else adjacent += game.board[j] == -1

                game.board[i] = adjacent
            }

            if (make) {
                cell.addEventListener("contextmenu", flag(i))
                cell.onclick = press(i)
                row.appendChild(cell)
                display.push(cell)
            }
        }
    }

    return {
        generate: generate,
        r: reveal,
        n: get_neighbours,
        game: game
    }
})()