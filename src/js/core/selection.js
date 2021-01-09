class Selection {
    constructor (e) {
        this.element = e
        this.sel = undefined
        this.initial = undefined

        this.imousemove = this.mousemove
        this.imouseup = this.mouseup

        // Add handlers
        e.addEventListener("mousedown", this.mousedown)

        e.addEventListener("mousedown", _ => {
            console.log("HELLO")
        })
    }

    create_selection(x, y) {
        this.sel = document.createElement("div")
        this.sel.classList.add("selection")

        this.sel.classList.remove("fade")
        this.sel.style.top = y + "px"
        this.sel.style.left = x + "px"

        this.element.appendChild(this.sel)
    }

    mousedown = e => {
        this.create_selection(e.clientX, e.clientY)
        this.initial = [e.clientX, e.clientY]

        document.addEventListener("mousemove", this.imousemove)
        document.addEventListener("mouseup", this.imouseup)
    }

    mousemove = e => {
        if (this.initial == undefined) return

        this.sel.style.width = Math.abs(this.initial[0] - e.clientX) + "px"
        this.sel.style.height = Math.abs(this.initial[1] - e.clientY) + "px"

        // For some reason inner(Width|Height) is larger than the actual
        // size of the document. This causes a gap when going from
        // one side of the initial point to another (e.g. left->right).
        // Therefore, use the bounding client rect of background element
        // to get the size of the viewable portion.
        // The selection element uses fixed positioning, so coordinates
        // are relative to the top left of the screen.
        let box = document.getElementById("background").getBoundingClientRect()

        if (e.clientX <= this.initial[0]) {
            this.sel.style.right = (box.width - this.initial[0]) + "px"
            this.sel.style.left = null
        } else {
            this.sel.style.left = this.initial[0] + "px"
            this.sel.style.right = null
        }

        if (e.clientY <= this.initial[1]) {
            this.sel.style.bottom = (box.height - this.initial[1]) + "px"
            this.sel.style.top = null
        } else {
            this.sel.style.top = this.initial[1] + "px"
            this.sel.style.bottom = null
        }
    }

    mouseup = _ => {
        if (this.initial == undefined) return
        let sel = this.sel
        sel.classList.add("fade")
        this.initial = undefined

        setTimeout(() => { sel.remove() }, 75)
    }
}
