class Card {
    constructor (color, number, container) {
        this.color = color
        this.number = number
        this.container = container

        this.generate_card()
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
    }
}

class Column {
    constructor () {

    }
}

class Shenzhen {
    constructor () {
        this.board = document.getElementById("shenzhen")

        this.rows = Array.from(document.getElementById("shenzhen").children[1].children[0].children)
        this.rows[0].appendChild(new Card("black", "5", this.board).card)
    }
}

H.SH = new Shenzhen()