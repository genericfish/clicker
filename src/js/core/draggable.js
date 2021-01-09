class Draggable {
    constructor (interactive, parent, container) {
        if (!(interactive instanceof Element))
            throw new Exception("[Drag] Expected HTML Element.")

        // Assume entire element is draggable.
        if (parent == undefined) parent = interactive

        this.previous = [0,0]
        this.draggable = interactive
        this.parent = parent
        this.hooks = { mouseup: [], mousemove: [], mousedown: [] }

        this.setup()
    }

    setup() {
        this.f_drag = this.drag(this)

        this.draggable.addEventListener("mousedown", e => {
            e.preventDefault()

            // only activate on lmb
            if (e.buttons != 1) return

            // don't double drag
            if (this.parent.hasAttribute("data-dragged")) return

            let cancel = false

            if (this.hooks.mousedown.length)
                for (let cb of this.hooks.mousedown)
                    cancel |= cb(e)

            if (cancel) return

            this.onmousedown(e)
        })

        document.addEventListener("mouseup", e => {
            if (this.parent.hasAttribute("data-dragged")) {
                if (this.hooks.mouseup.length)
                    for (let cb of this.hooks.mouseup)
                        cb(e)

                this.parent.removeAttribute("data-dragged")

                document.removeEventListener("mousemove", this.f_drag)
            }
        })
    }

    drag(inst) {
        return e => {
            e.preventDefault()

            let cancel = false

            if (inst.hooks.mousemove.length)
                for (let cb of inst.hooks.mousemove)
                    cancel |= cb(e)

            if (cancel) return

            inst.onmousemove(e)
        }
    }

    onmousedown(e) {
        this.previous = [e.clientX, e.clientY]
        this.parent.setAttribute("data-dragged", "data-dragged")

        document.addEventListener("mousemove", this.f_drag)
    }

    onmousemove(e) {
        const x = this.parent.offsetLeft - this.previous[0] + e.clientX
        const y = this.parent.offsetTop - this.previous[1] + e.clientY

        if (this.container) {
            let box = this.parent.getBoundingClientRect()
            let container = this.container.getBoundingClientRect()
            let bits = this.detect_relative(x, y, container, box)

            switch (bits & 3) {
                case 0:
                    this.parent.style.left = x + "px"
                    this.previous[0] = e.clientX
                    break
                case 1:
                    this.parent.style.left = "0px"
                    break
                case 2:
                    this.parent.style.left = (container.width - box.width) + "px"
                    break
            }
    
            switch (bits >> 2) {
                case 0:
                    this.parent.style.top = y + "px"
                    this.previous[1] = e.clientY
                    break
                case 1:
                    this.parent.style.top = "0px"
                    break
                case 2:
                    this.parent.style.top = (container.height - box.height - 1) + "px"
                    break
            }
        } else {
            this.parent.style.left = x + "px"
            this.parent.style.top = y + "px"
            this.previous = [e.clientX, e.clientY]
        }
    }

    detect(x, y, container, box) {
        // Detect collision using absolute (window) coordinates
        if (this.container == undefined) return 0

        container = container || this.container.getBoundingClientRect()
        box = box || this.parent.getBoundingClientRect()

        x = x || box.x
        y = y || box.y

        return +(y + box.height > container.bottom) << 3 |
            +(y < container.top) << 2 |
            +(x + box.width > container.right) << 1 |
            +(x < container.left)
    }

    detect_relative(x, y, container, box) {
        // Detect collision using relative (element) coordinates
        if (this.container == undefined) return 0

        container = container || this.container.getBoundingClientRect()
        box = box || this.parent.getBoundingClientRect()

        x = x || box.offsetLeft
        y = y || box.offsetTop

        return +(y + box.height > container.height) << 3 |
            +(y < 0) << 2 |
            +(x + box.width > container.width) << 1 |
            +(x < 0)
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

    in_bounds(x, y) {
        return x >= this.bounds[0] &&
                x <= this.bounds[2] &&
                y >= this.bounds[1] &&
                y <= this.bounds[3]
    }
}
