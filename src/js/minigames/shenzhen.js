(() => {
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
                y + 35 * (e.count - 1)
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

        reattach() {
            if (this._mouseup) {
                let ret = this._mouseup()
                if (ret instanceof Array && ret.length) {
                    ret = ret[0]

                    if (ret.element != this.parent && ret.check(this)) {
                        this.col.remove(this)
                        ret.add(this, false)

                        return true
                    }
                }
            }

            return false
        }

        slide(x, y, z) {
            let xn = x - this.card.offsetLeft
            let yn = y - this.card.offsetTop

            if (!xn && !yn) return this.z = z

            this.card.style.transform = `translate(${xn}px,${yn}px)`
            this.card.style.transition = "transform .2s ease"

            setTimeout(_ => {
                this.card.style.transform = null
                this.card.style.transition = null
                this.card.style.zIndex = z

                this.x = x
                this.y = y
            }, 210)
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
                this.reattach()
                this.slide(...this.initial, this.focus)
            })
            this.drag.add_hook("mousedown", _ => { return !this.draggable || !(++this.z || 1) })
        }

        set x(v) { this.card.style.left = v + "px" }
        set y(v) { this.card.style.top = v + "px" }
        set z(v) { this.card.style.zIndex = v }

        get x() { return parseInt(this.card.style.left) || 0 }
        get y() { return parseInt(this.card.style.top) || 0 }
        get z() { return parseInt(this.card.style.zIndex) || 0 }
    }

    class Column {
        constructor (id, rules, focus, drag, lift) {
            let element = document.createElement("div")

            element.classList.add("col")

            this.element = element
            this.id = id || 0
            this.focus = focus
            this.cards = []
            this.drag = drag
            this.lift = lift
            this.rules = rules
        }

        add(v, move) {
            if (!(v instanceof Card)) return

            for (let card of this.cards)
                card.draggable = false

            this.cards.push(v)
            v.attach(this, move)
        }

        remove(v) {
            if (!(v instanceof Card)) return

            if (this.cards.includes(v)) {
                this.cards.splice(this.cards.indexOf(v), 1)
                this.last.draggable = true
                v.detach()
            }
        }

        check(v) {
            return !!this.count &&
                this.rules[v.color] != this.last.color &&
                !(this.rules["" + v.number] || []).includes(this.last.number) &&
                !(this.rules["" + v.number] || []).includes("*") &&
                (parseInt(v.number) || -1) == (parseInt(this.last.number) || -1) - 1
        }

        get count() { return this.cards.length }
        get last() { return this.cards[this.count - 1] }
    }

    class Shenzhen {
        constructor () {
            this.board = document.getElementById("shenzhen")
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

            this.generate_columns()
            this.generate_cards()

            this.ready()
        }

        generate_columns() {
            this.columns = []

            for (let i = 0; i < 8; i++) {
                let col = new Column(i, this.rules, this.z,
                    e => {
                        for (let el of document.elementsFromPoint(e.clientX, e.clientY))
                            if (Array.from(el.classList).includes("col") && this.focused != el)
                                this.focused = el
                    },
                    _ => {
                        if (this.focused != undefined) {
                            let focused = this.focused
                            this.focused = undefined

                            return this.columns.filter(col => col.element == focused)
                        }
                    })
                this.columns.push(col)
                this.board.appendChild(col.element)
            }
        }

        generate_cards() {
            let colors = ["red", "green", "black"]
            let cards = [new Card(colors[0], 'f', this.board)]

            for (let i = 0; i < 39; i++)
                cards.push(new Card(colors[~~(i / 13)], i % 13 + 1, this.board))

            let k = _ => { return crypto.getRandomValues(new Uint8Array(1))[0] % 40 }
            for (let j = 39, g = k(); j > 0; j--, g = k())
                [cards[g], cards[j]] = [cards[j], cards[g]]

            cards.forEach((card, index) => this.columns[index % 8].add(card))
        }

        ready() { }
    }

    H.SH = new Shenzhen()
})()