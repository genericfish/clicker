let ms = (() => {
    const colors = [
        null,      // empty
        "blue",    // 1
        "green",   // 2
        "red",     // 3
        "purple",  // 4
        "maroon",  // 5
        "#00A0A0", // 6
        "black",   // 7
        "#686868"  //8
    ]

    const defaultHTML = `<div class="buy"style="margin-top:-50px;width:400px;text-align:center;padding:5px;"><p>Purchase khoisweeper for 5000 gamergoo</p><img style="margin:0 auto;" src="assets/images/buildings/minesweeper.png"width="300"height="300"alt=""></div>`

    const difficulties = [
        [8,10,10,false],  // Easy
        [14,18,40,false], // Medium
        [20,24,99,true]   // Hard
    ]

    // Default is medium
    let difficulty = 1

    let ROWS, COLS, MAX_MINE, SMALL
    [ROWS, COLS, MAX_MINE, SMALL] = difficulties[1]

    let board = document.getElementById("minesweeper")

    let ms = {
        mines: [],
        board: [],
        flags: MAX_MINE,
        visible: 0,
        time: 0,
        over: false
    }

    let display = []
    let flags = document.getElementById("ms-flags")
    let time = document.getElementById("ms-time")
    let timer = undefined

    function get_neighbours(i) {
        // Get the 8 neighbouring squares
        let adj = [
            i - COLS - 1,
            i - COLS,
            i - COLS + 1,
            i - 1,
            i + 1,
            i + COLS - 1,
            i + COLS,
            i + COLS + 1
        // Remove if out of bounds
        ].map(x => x < 0 ? null : x >= (ROWS * COLS) ? null : x)

        // More conditionals to check if out of wrapping to new line
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
        // Generate board
        // generate(-1) generates the blank board
        // generate(n) generates a board, where n represents square of the first click
        n = n || 0

        ms.mines = []
        ms.board = new Array(COLS * ROWS).fill(0)

        if (n >= 0 && n <= COLS * ROWS) {
            let adj = get_neighbours(n)
            for (let mine = 0; mine < MAX_MINE; mine++) {
                let spot = undefined
    
                while (spot == undefined ||
                        adj.includes(spot) ||   // Ignore the 8 adjacent
                        spot == n ||            // Ignore the clicked spot
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
        ms.over = true

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
        ms.over = true

        let win = document.createElement("div")
        let xin = document.createElement("div")

        // Give 20 minutes worth of gamergoo
        let gamergoo = game.get("rate") * (20 * 60)

        // Capped at 25% of currently owned gamergoo
        if (gamergoo > (game.get("gamergoo") * .25)) gamergoo = game.get("gamergoo") * .25

        // Regardless, give 65k gamergoo
        gamergoo = Math.max(65000, gamergoo)

        // Multiplier depending on difficulty
        //     Easy: 0.1x
        //     Medium: normal
        //     Hard: 1.25x
        if (difficulty == 0) gamergoo *= .1
        else if (difficulty == 2) gamergoo *= 1.25

        game.worker.port.postMessage(["add", [gamergoo, true]])

        win.id = "winner"
        xin.innerHTML = `you are win<br>+${nice_format(Math.ceil(gamergoo))} gamergoo`

        win.appendChild(xin)

        board.appendChild(win)
    }

    function flag(i) {
        return e => {
            e.preventDefault()

            if (ms.over || ms.board[i] == -2) return

            let html = display[i].innerHTML

            if (html.charCodeAt(0) != 9873) {
                if (ms.flags <= 0) return

                html = "&#x2691;"
                display[i].style.color = "#f00"
                ms.flags--
            } else {
                html = "&nbsp;"
                ms.flags++
                display[i].style.color = null
            }

            display[i].innerHTML = html
            flags.innerHTML = ms.flags
        }
    }

    function reveal(i) {
        if (i == null) return
        if (!ms.mines.length) generate(i)

        let val = ms.board[i]
        let element = board.children[Math.floor(i / COLS)].children[i % COLS]

        if (val == -2 || element.innerHTML.charCodeAt(0) == 9873) return
        if (ms.board[i] == -1) return game_over()

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
            if (!ms.over) {
                if (display[i].innerHTML != "&#x2691;") reveal(i)

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

        if (game.get("towers").minesweeper[0] == 0) {
            document.getElementById("ms-stats").style.visibility = "hidden"
            board.innerHTML = defaultHTML
            board.style.minWidth = null
            return
        } else {
            document.getElementById("ms-stats").style.visibility = null
            display = []
            make = true
        }

        if (!make && display.length != COLS * ROWS) {
            display = []
            make = true
        }

        clearInterval(timer)

        ms.flags = MAX_MINE
        ms.over = false
        ms.visible = COLS * ROWS
        ms.time = 0

        timer = undefined

        flags.innerHTML = ms.flags
        time.innerHTML = 0

        if (!make)
            // Clear all classes from existing buttons
            for (let e of display)
                e.className = ""
        else {
            // The children does not update when innerHTML is emptied
            // therefore, remake the element to get proper resizing
            // from the client bounding rectangle
            let parent = board.parentElement

            board.remove()
            board = document.createElement("div")
            board.id = "minesweeper"

            parent.appendChild(board)
        }

        for (let i = 0; i < COLS * ROWS; i++) {
            if (i % COLS == 0 && make) {
                row = document.createElement("div")
                board.appendChild(row)
            }

            let cell = make ? document.createElement("button") : display[i]

            cell.innerHTML = "&nbsp;"
            cell.style.color = null

            if (SMALL) cell.classList.add("small")

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

        board.style.minWidth = board.children[0].getBoundingClientRect().width + "px"
    }

    return {
        generate: generate,
        difficulty: (e) => {
            try {
                let i = parseInt(e.value) - 1

                ROWS = difficulties[i][0]
                COLS = difficulties[i][1]
                MAX_MINE = difficulties[i][2]
                SMALL = difficulties[i][3]

                difficulty = i

                generate(-1)
            } catch (except) { }
        }
    }
})()
