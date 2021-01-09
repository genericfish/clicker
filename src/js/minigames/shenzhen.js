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

        attach(e, focus = 0, offset_x = 0, offset_y = 0, mousemove, mouseup) {
            this.parent = e
            e.appendChild(this.card)

            this.initial = [
                this.card.offsetLeft + offset_x,
                this.card.offsetTop + offset_y
            ]

            this.focus = focus
            this.x = this.initial[0]
            this.y = this.initial[1]
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

                    if (ret.element != this.parent) {
                        this.detach()
                        this.attach(...ret.pack)
                    }
                }
            }
        }

        slide(x, y, z) {
            let xn = x - this.card.offsetLeft
            let yn = y - this.card.offsetTop

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
                this.slide(...[...this.initial, this.focus])
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

    class Column extends Area {
        constructor (id, parent, focus, drag, lift) {
            let element = document.createElement("div")
            super(element)

            element.classList.add("col")
            parent.appendChild(element)

            this.element = element
            this.id = id || 0
            this.focus = focus
            this.cards = []
            this.drag = drag
            this.lift = lift

            this.count = 0
        }

        add(v) {
            if (!(v instanceof Card)) return

            for (let card of this.cards)
                card.draggable = false

            this.cards.push(v)
            v.attach(...this.pack)
        }

        remove(v) {
            if (!(v instanceof Card)) return

            if (this.cards.includes(v)) {
                this.cards.splice(this.cards.indexOf(v), 1)
                v.detach()
            }
        }

        get pack() { return [this.element,this.focus,0,this.count++*35,this.drag,this.lift] }
    }

    class Shenzhen {
        constructor () {
            this.board = document.getElementById("shenzhen")
            this.cards = []
            this.z = parseInt(this.board.parentElement.parentElement.style.zIndex)

            this.generate_columns()
            this.generate_cards()

            this.ready()
        }

        generate_columns() {
            this.columns = []

            for (let i = 0; i < 8; i++) {
                let col = new Column(i, this.board, this.z,
                    e => {
                        for (let el of document.elementsFromPoint(e.clientX, e.clientY)) {
                            if (Array.from(el.classList).includes("col") &&
                                this.focused != el
                            ) {
                                if (this.focused != undefined)
                                    this.focused.classList.remove("active")

                                this.focused = el
                                el.classList.add("active")
                            }
                        }
                    },
                    _ => {
                        if (this.focused != undefined) {
                            let focused = this.focused

                            this.focused.classList.remove("active")
                            this.focused = undefined

                            return this.columns.filter(col => col.element == focused)
                        }
                    })
                this.columns.push(col)
            }
        }

        generate_cards() {
            let colors = ["red", "green", "black"]

            for (let i = 0; i < 39; i++) {
                this.columns[i % 8].add(
                    new Card(colors[~~(i / 13)], i % 13 + 1, this.board)
                )
            }

            this.columns[7].add(new Card(colors[0], 'f', this.board))
        }

        ready() { }
    }

    H.SH = new Shenzhen()
})()