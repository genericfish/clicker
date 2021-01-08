class Draggable {
    constructor (interactive, parent) {
        if (!(interactive instanceof Element))
            throw new Exception("[Drag] Expected HTML Element.")

        // Assume entire element is draggable.
        if (parent == undefined) parent = interactive

        this.previous = [0,0]
        this.draggable = interactive
        this.container = parent
        this.hooks = { mouseup: [], mousemove: [], mousedown: [] }

        this.setup()
    }

    setup() {
        let drag_func = this.drag(this)

        this.draggable.addEventListener("mousedown", e => {
            e.preventDefault()

            // only activate on lmb
            if (e.buttons != 1) return

            this.previous = [e.clientX, e.clientY]
            this.container.setAttribute("data-dragged", "data-dragged")

            if (this.hooks.mousedown.length)
                for (let cb of this.hooks.mousedown)
                    cb(e)

            document.addEventListener("mousemove", drag_func)
        })

        document.addEventListener("mouseup", e => {
            document.removeEventListener("mousemove", drag_func)
            this.container.removeAttribute("data-dragged")

            if (this.hooks.mouseup.length)
                for (let cb of this.hooks.mouseup)
                    cb(e)
        })
    }

    drag(inst) {
        return e => {
            e.preventDefault()

            if (inst.hooks.length)
                for (let cb of inst.hooks.mousemove)
                    cb(e)

            const x = inst.container.offsetLeft - inst.previous[0] + e.clientX
            const y = inst.container.offsetTop - inst.previous[1] + e.clientY

            inst.container.style.left = x + "px"
            inst.container.style.top = y + "px"

            inst.previous = [e.clientX, e.clientY]
        }
    }

    add_hook(event, cb) { if (this.hooks.hasOwnProperty(event)) this.hooks[event].push(cb) }
}

class DropArea {
    constructor (e) {
        if (!(e instanceof Element))
            throw new Exception("[DropArea] Expected HTML Element.")

        this.area = e
        this.whitelist = {
            id: [],
            class: [],
            elements: []
        }

        let box = e.getBoundingClientRect()
        this.bounds = [
            box.left,
            box.top,
            box.left + box.width,
            box.top + box.height
        ]
    }

    add(v) {
        if (typeof v == "string")
            if (v.charAt(0) == '#')
                this.whitelist.id.push(v.substr(1))
            else
                this.whitelist.class.push(v)
        else if (v instanceof Element)
            this.whitelist.elements.push(v)
    }

    in_whitelist(e) {
        return this.whitelist.id.includes(e.id) ||
                Array.from(e.classList).reduce(a,b => a || this.whitelist.class.includes(b)) ||
                this.elements.includes(e)
    }

    in_bounds(x, y) {
        return x >= this.bounds[0] &&
                x <= this.bounds[2] &&
                y >= this.bounds[1] &&
                y <= this.bounds[3]
    }
}
