let Shenzhen = (_ => {
    class Card {
        constructor (color, number, container) {
            this.color = color
            this.number = number
            this.container = container
            this.draggable = true
            this.focus = 0

            this.generate_card()
        }

        attach(e, move = true, x = 0, y = 0) {
            let focus = e.focus
            let mousemove = e.drag
            let mouseup = e.lift

            this.col = e
            this.parent = e.element
            this.parent.appendChild(this.card)

            this.initial = [
                x + this.parent.offsetLeft + ~~((
                    this.parent.getBoundingClientRect().width -
                    this.card.getBoundingClientRect().width
                    ) / 2),
                y + 28 * (e.count - 1) + 175
            ]

            if (move) {
                this.x = this.initial[0]
                this.y = this.initial[1]
            }

            this.focus = focus
            this.z = focus
            this._mousemove = mousemove
            this._mouseup = mouseup

            if (this._mousemove != undefined)
                this.drag.add_hook("mousemove", this._mousemove)
        }

        detach() {
            if (this.parent == undefined) return

            this.parent.removeChild(this.card)
            this.drag.remove_hook("mousemove", this._mousemove)
            this.initial = [0, 0]
            this._mousemove = undefined
        }

        move(col, verify = false, offset_x = 0, offset_y = 0) {
            if (col instanceof Column && col.element != this.parent && (!verify || col.verify(this))) {
                this.col.remove(this)
                col.add(this, false, offset_x, offset_y)
                this.slide(...this.initial, this.focus)

                return true
            }

            return false
        }

        reattach() {
            if (this._mouseup) {
                let ret = this._mouseup()
                if (ret instanceof Array && ret.length) {
                    let children = this.children.slice()
                    let m = this.move(ret[0], true)

                    if (children.length && m)
                        children.forEach(child => child.move(ret[0], true))

                    return m
                }
            }

            return false
        }

        slide(x, y, z) {
            let xn = x - this.card.offsetLeft
            let yn = y - this.card.offsetTop

            if (!xn && !yn) return this.z = z

            this.card.style.transform = `translate(${xn}px,${yn}px)`
            this.card.style.transition = "transform .15s ease"

            setTimeout(_ => {
                this.card.style.transform = null
                this.card.style.transition = null
                this.card.style.zIndex = z

                this.x = x
                this.y = y
            }, 160)
        }

        generate_card() {
            let card = document.createElement("div")
            this.card = card

            card.classList.add("card")
            card.classList.add(this.color)
            card.classList.add("card-" + this.number)

            this.drag = new Draggable(card)

            if (this.container)
                this.drag.container = this.container

            this.drag.add_hook("mouseup", _ => {
                if (!this.reattach()) {
                    this.slide(...this.initial, this.focus)

                    if (this.children.length)
                        this.children.forEach(child => child.slide(...child.initial, child.focus))
                }
            })

            // very bad abuse of syntax
            this.drag.add_hook("mousedown", _ => !this.draggable || !(++this.z || 1) || !(!this.children.length || this.children.forEach(child => ++child.z) || 1) )

            this.drag.add_hook("mousemove", _ => {
                if (!this.children.length) return

                this.children.forEach((child, i) => {
                    child.x = this.x
                    child.y = this.y + 28 * (i + 1)
                    child.z = this.z
                })
            })
        }

        set x(v) { this.card.style.left = v + "px" }
        set y(v) { this.card.style.top = v + "px" }
        set z(v) { this.card.style.zIndex = v }

        get x() { return parseInt(this.card.style.left) || 0 }
        get y() { return parseInt(this.card.style.top) || 0 }
        get z() { return parseInt(this.card.style.zIndex) || 0 }

        get children() {
            if (this.col && this.col.count)
                return this.col.cards.slice(this.col.cards.indexOf(this) + 1, this.col.count)
        }
    }

    class Column {
        constructor (id, rules, focus, drag, lift, check) {
            this.element = document.createElement("div")
            this.element.classList.add("col")

            this.id = id || 0
            this.rules = rules
            this.focus = focus
            this.drag = drag
            this.lift = lift
            this.check = check

            this.cards = []
        }

        add(v, move, offset_x = 0, offset_y = 0) {
            if (!(v instanceof Card)) return

            for (let card of this.cards)
                card.draggable = false

            this.cards.push(v)
            v.attach(this, move, offset_x, offset_y)

            this.detect()
        }

        remove(v) {
            if (!(v instanceof Card)) return

            if (this.cards.includes(v)) {
                this.cards.splice(this.cards.indexOf(v), 1)

                if (this.last != undefined)
                    this.last.draggable = true

                v.detach()
                setTimeout(this.check, 20)
                this.detect()
            }
        }

        detect() {
            // detect whether cards that are not last in column
            // should be able to move

            if (this.count <= 1) return

            for (let i = this.count - 1; i > 0; i--) {
                if (this.verify(this.cards[i], this.cards[i - 1]))
                    this.cards[i - 1].draggable = true
                else
                    break
            }
        }

        verify(v, n) {
            n = n || this.last

            return !this.count || this.count &&
                this.rules[v.color] != n.color &&
                !(this.rules[n.number] || []).includes(v.number) &&
                !(this.rules[n.number] || []).includes("*") &&
                (parseInt(v.number) || MAX_INT) == (parseInt(n.number) || MAX_INT) - 1
        }

        get count() { return this.cards.length }
        get last() { return this.cards[this.count - 1] }
    }

    class Tray extends Column {
        constructor (id, focus, drag, lift, check) { super(id, {}, focus, drag, lift, check) }

        add(v, move, offset_x = 0, offset_y = 0) { super.add(v, move, offset_x, -165 + offset_y) }
        verify(v) { return !this.count && !v.children.length }
    }

    class Bin extends Column {
        constructor (id, focus, drag, lift, check) { super(id, {}, focus, drag, lift, check) }

        add(v, move, offset_x = 0, offset_y = 0) {
            super.add(v, move, offset_x, -165 - this.count * 28 + offset_y)
            v.drag.remove()
        }

        verify(v) {
            let num = parseInt(v.number) || MAX_INT

            if (num > 9 || v.children.length) return false

            if (this.count)
                return this.last.color == v.color &&
                        (parseInt(this.last.number) || MAX_INT) == (num - 1)
            else
                return num == 1
        }
    }

    class FlowerBin extends Column {
        constructor (id, focus, drag, lift) {
            super(id, {}, focus, drag, lift)

            this.element.classList.add("flower")
        }

        add(v, move) {
            super.add(v, move, 0, -165)
            v.drag.remove()
        }

        verify(v) { return v.number == 'f' }
    }

    function game_win() {
        if (H.SH.win) return

        // Give 25 minutes worth of gamergoo
        let gamergoo = game.get("rate") * (25 * 60)

        // Capped at 30% of currently owned gamergoo
        if (gamergoo > (game.get("gamergoo") * .3)) gamergoo = game.get("gamergoo") * .3

        // Regardless, give 35k gamergoo
        gamergoo = Math.max(35000, gamergoo) || 35000

        popup(`win ${nice_format(Math.trunc(gamergoo))} gamergoo`)

        game.worker(["add", [gamergoo, true]])
        H.SH.win = true
    }

    function purchase() { popup("you must purchase this game from the shop for 10000 gamergoo") }

    function popup(message) {
        let board = H.WM.get("shenzhen solitaire").get("shenzhen")
        let popup = document.createElement("div")

        popup.classList.add("sh-popup")
        popup.classList.add("win")
        popup.innerHTML = `<div>${message}</div>`

        popup.style.zIndex = H.WM.get("shenzhen solitaire").z + 1

        board.appendChild(popup)
    }

    class Shenzhen {
        constructor () {
            this.win = H.WM.get("shenzhen solitaire")
            this.board = this.win.get("shenzhen")
            this.trays = this.win.get("trays")
            this.bins = this.win.get("bins")

            this.cards = []
            this.z = parseInt(this.board.parentElement.parentElement.style.zIndex)

            this.rules = {
                // rules define the set of exclusions
                "red": "red",
                "green": "green",
                "black": "black",
                "f": "*",
                "10": "*",
                "11": "*",
                "12": "*",
                "13": "*",
            }

            this.id = this.win.id
            this.generate = true

            H.WM.add_hook("maximize", this.id, this.maximize_hook)
            this.win.body.parentElement.style.background = "#028A0F"

            if (this.win.s == 0) this.restart()
        }

        maximize_hook = _ => {
            if (this.generate)
                setTimeout(this.restart, 85)
        }

        generate_cards() {
            let colors = ["red", "green", "black"]
            let cards = [new Card(colors[0], 'f', this.board)]

            for (let i = 0; i < 39; i++)
                cards.push(new Card(colors[~~(i / 13)], i % 13 + 1, this.board))

            for (let j = 39, g = random(39); j > 0; j--, g = random(39))
                [cards[g], cards[j]] = [cards[j], cards[g]]

            cards.forEach((card, index) => this.columns[index % 8].add(card))
        }

        generate_columns() {
            this.columns = []

            for (let i = 0; i < 8; i++) {
                let col = new Column(i, this.rules, this.z, this.drag, this.lift, this.check)
                this.columns.push(col)
                this.board.appendChild(col.element)
            }

            for (let i = 8; i < 11; i++) {
                let tray = new Tray(i, this.z, this.drag, this.lift, this.check)
                this.columns.push(tray)
                this.trays.appendChild(tray.element)
            }

            let flower_bin = new FlowerBin(11, this.z, this.drag, this.lift, this.check)
            this.columns.push(flower_bin)
            this.bins.appendChild(flower_bin.element)

            for (let i = 12; i < 15; i++) {
                let bin = new Bin(i, this.z, this.drag, this.lift, this.check)
                this.columns.push(bin)
                this.bins.appendChild(bin.element)
            }
        }

        drag = e => {
            for (let el of document.elementsFromPoint(e.clientX, e.clientY))
                if (Array.from(el.classList).includes("col") && this.focused != el)
                    this.focused = el
        }

        lift = _ => {
            if (this.focused != undefined) {
                let focused = this.focused
                this.focused = undefined

                return this.columns.filter(col => col.element == focused)
            }
        }

        check = _ => {
            if (this.moves) return

            let empty = 0
            let dragons = {
                "red": [],
                "green": [],
                "black": []
            }

            for (let i = 0; i < 11; i++) {
                let col = this.columns[i]

                if (i < 8 && !col.count) {
                    ++empty
                    continue
                }

                if (col.count) {
                    let bins = this.columns.slice(12, 15)
                    let min = bins.reduce(
                        (acc, cur) =>
                            Math.min(
                                acc,
                                cur.count ? (parseInt(cur.last.number) || MAX_INT) : 0
                            )
                    , MAX_INT)
                    let last = col.last

                    // If we move a card, we stop execution of the function.
                    // On move, the remove function will be called, which
                    // calls this function again.

                    if (last.number > 9) dragons[last.color].push(i)

                    // Automatically move flower card to flower bin
                    if (last.number == 'f')
                        return last.move(this.columns[11])

                    // Always move a 1 or 2 to a bin, or whenever the current card is
                    // one above the minimum of all 3 bins (where empty bins are 0)
                    if (last.number <= 2 || last.number == min + 1)
                        for (let bin of bins) {
                            if (bin.verify(last)) {
                                last.draggable = false
                                setTimeout(_ => last.move(bin), 165)

                                return
                            }
                        }
                }
            }

            this.check_dragon(dragons)
            if (empty == 8) game_win()
        }

        check_dragon(dragons) {
            this.dragons = dragons

            for (let [dragon, cols] of Object.entries(dragons)) {
                if (cols.length < 4) continue

                let trays = this.columns.slice(8, 11)
                let available = trays.reduce((acc, cur, ind) =>
                    Math.min(
                        acc,
                        cur.count ?
                            cur.last.color == dragon && cur.last.number > 9 ?
                                ind :
                                MAX_INT :
                        ind
                    ), MAX_INT
                )

                let button = H.WM.get("shenzhen solitaire").get("dragon-" + dragon)

                if (available != MAX_INT) {
                    button.removeAttribute("disabled")
                    button.onclick = _ => {
                        button.setAttribute("disabled", "disable")
                        this.collect(dragon, available)
                    }
                    button.ontouchstart = _ => {
                        button.setAttribute("disabled", "disable")
                        this.collect(dragon, available)
                    }
                } else {
                    button.setAttribute("disabled", "disabled")
                    button.onclick = null
                    button.ontouchstart = null
                }
            }
        }

        collect(dragon, available) {
            let still_works = true

            // FIXME: Actually make this check work
            this.dragons[dragon].forEach(cur => {
                let col = this.columns[cur]

                if (!col.count) still_works = false
                else if (col.last.color != dragon || (parseInt(col.last.number) || 0) < 10)
                    still_works = false
            })

            if (!still_works) return

            for (let i in this.dragons[dragon]) {
                let card = this.columns[this.dragons[dragon][i]].last
                let tray = this.columns[8 + available]

                card.move(tray, false, 0, -tray.count * 28)
                card.drag.remove()
                card.card.classList.add("flip")
            }
        }

        restart = _ => {
            let popups = Array.from(document.getElementsByClassName("sh-popup"))

            if (popups.length)
                for (let popup of popups)
                    popup.remove()

            this.cards = []
            this.win = false

            if (this.columns)
                this.columns.forEach(col => col.element.remove())

            this.generate_columns()

            if (!game.get("minigames").shenzhen)
                return purchase()

            this.generate_cards()
            this.generate = false

            this.check()
        }
    }

    return _ => { H.SH = new Shenzhen() }
})()
