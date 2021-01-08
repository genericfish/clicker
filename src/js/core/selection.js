class Selection {
    constructor (e) {
        this.element = e
        this.sel = undefined
        this.initial = undefined

        this.imousemove = this.mousemove(this)
        this.imouseup = this.mouseup(this)

        // Add handlers
        e.addEventListener("mousedown", this.mousedown(this))
    }

    create_selection(x, y) {
        this.sel = document.createElement("div")
        this.sel.classList.add("selection")

        this.sel.classList.remove("fade")
        this.sel.style.top = y + "px"
        this.sel.style.left = x + "px"

        this.element.appendChild(this.sel)
    }

    mousedown(inst) {
        return e => {
            inst.create_selection(e.clientX, e.clientY)
            inst.initial = [e.clientX, e.clientY]

            document.addEventListener("mousemove", inst.imousemove)
            document.addEventListener("mouseup", inst.imouseup)
        }
    }

    mousemove(inst) {
        return e => {
            if (inst.initial == undefined) return

            inst.sel.style.width = Math.abs(inst.initial[0] - e.clientX) + "px"
            inst.sel.style.height = Math.abs(inst.initial[1] - e.clientY) + "px"

            if (e.clientX <= inst.initial[0]) {
                // For some reason innerWidth is larger than client rect width
                // This causes the selection to have a gap when going from
                // right to left of initial selection, or vice versa.
                inst.sel.style.right =
                    (document.body.getBoundingClientRect().width - inst.initial[0]) + "px"
                inst.sel.style.left = null
            } else {
                inst.sel.style.left = inst.initial[0] + "px"
                inst.sel.style.right = null
            }

            if (e.clientY <= inst.initial[1]) {
                inst.sel.style.bottom = (window.innerHeight - inst.initial[1]) + "px"
                inst.sel.style.top = null
            } else {
                inst.sel.style.top = inst.initial[1] + "px"
                inst.sel.style.bottom = null
            }
        }
    }

    mouseup(inst) {
        return _ => {
            if (inst.initial == undefined) return
            let sel = inst.sel
            sel.classList.add("fade")
            inst.initial = undefined

            setTimeout(() => { sel.remove() }, 75)
        }
    }
}
