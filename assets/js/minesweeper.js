let ms = (() => {
    const ROWS = 14
    const COLS = 18
    const MAX_MINE = 40

    const colors = [
        "black",
        "blue",
        "green",
        "red",
        "purple",
        "maroon",
        "#00A0A0",
        "black",
        "#686868"
    ]

    let board = document.getElementById("minesweeper")

    let ms = {
        mines: undefined,
        board: undefined,
        flags: MAX_MINE,
        visible: undefined,
        time: 0,
    }

    let over = false
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

        ms.mines = []
        ms.board = new Array(COLS * ROWS).fill(0)

        if (n >= 0 && n <= COLS * ROWS) {
            let adj = get_neighbours(n)
            for (let mine = 0; mine < MAX_MINE; mine++) {
                let spot = undefined
    
                while (spot == undefined ||
                        adj.includes(spot) || // Ignore the 8 adjacent
                        spot == n || // Ignore the clicked spot
                        ms.mines.includes(spot) // Ignore spots that are already mines
                ) spot = Math.floor(Math.random() * (COLS * ROWS))
    
                ms.board[spot] = -1
                ms.mines.push(spot)
            }
        }

        setup()
    }

    function game_over() {
        clearInterval(timer)
        over = true
        for (let mine of ms.mines) {
            try {
                display[mine].style.color = "#f00"
                display[mine].innerHTML = "X"
            } catch (e) {
                console.log("error when attempting to access display: ", mine, display)
            }
        }
    }

    function game_win() {
        clearInterval(timer)
        over = true

        let win = document.createElement("div")
        let xin = document.createElement("div")

        // Give 20 minutes worth of gamergoo
        let gamergoo = game.get("rate") * (20 * 60)

        // Capped at 20% of currently owned gamergoo
        if (gamergoo > (game.get("gamergoo") * .2)) gamergoo = game.get("gamergoo") * .2

        // Regardless, give 50k gamergoo
        gamergoo = Math.max(50000, gamergoo)

        game.worker.postMessage(["add", [gamergoo, true]])

        win.id = "winner"
        xin.innerHTML = `you are win<br>+${nice_format(Math.ceil(gamergoo))} gamergoo`

        win.appendChild(xin)

        board.appendChild(win)
    }

    function flag(i) {
        return e => {
            e.preventDefault()

            if (over || ms.board[i] == -2) return

            let html = display[i].innerHTML

            if (html != "⚑") {
                if (ms.flags <= 0) return

                html = "⚑"
                display[i].style.color = "#f00"
                ms.flags--
            } else {
                html = "&nbsp;"
                ms.flags++
                display[i].style.color = "#000"
            }

            display[i].innerHTML = html
            flags.innerHTML = ms.flags
        }
    }

    function reveal(i) {
        if (!ms.mines.length) generate(i)
        if (i == null || ms.board[i] == -2) return
        if (ms.board[i] == -1) return game_over()

        let val = ms.board[i]
        let element = board.children[Math.floor(i / COLS)].children[i % COLS]

        if (element.innerHTML == "⚑") return

        if (val >= 0) { 
            element.innerHTML = val == 0 ? "&nbsp;" : val
            element.style.color = colors[val]
            element.classList.add("revealed")
            ms.visible--
            ms.board[i] = -2
        }

        if (ms.visible == MAX_MINE) return game_win()

        if (val != 0) return

        let adjacency = get_neighbours(i)

        for (let adj of adjacency)
            reveal(adj)
    }

    function press(i) {
        return () => {
            if (!over) {
                if (display[i].innerHTML != "⚑")
                    reveal(i)
                if (timer == undefined)
                    timer = setInterval(() => {
                        ms.time++
                        time.innerHTML = ms.time
                    }, 1000)
            }
        }
    }

    function setup() {
        if (ms.mines == undefined) return

        let make = !display.length
        let row = undefined
        let win = document.getElementById("winner")

        if (win) win.remove()

        clearInterval(timer)
        over = false

        ms.time = 0
        ms.flags = MAX_MINE
        ms.visible = COLS * ROWS

        flags.innerHTML = ms.flags
        time.innerHTML = 0
        timer = undefined

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

            if (ms.board[i] != -1) {
                let adjacent = 0

                for (let j of get_neighbours(i))
                    if (j == null) continue
                    else adjacent += ms.board[j] == -1

                ms.board[i] = adjacent
            }

            if (make) {
                cell.addEventListener("contextmenu", flag(i))
                cell.onclick = press(i)
                row.appendChild(cell)
                display.push(cell)
            }
        }
    }

    return { generate: generate }
})()