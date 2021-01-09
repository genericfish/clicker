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
        this.draggable.addEventListener("touchstart", this.start)
        this.draggable.addEventListener("mousedown", this.start)

        document.addEventListener("mouseup", this.stop)
        document.addEventListener("touchend", this.stop)
        document.addEventListener("touchcancel", this.stop)
    }

    start = e => {
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
    }

    stop = e => {
        if (this.parent.hasAttribute("data-dragged")) {
            if (this.hooks.mouseup.length)
                for (let cb of this.hooks.mouseup)
                    cb(e)

            this.parent.removeAttribute("data-dragged")

            document.removeEventListener("mousemove", this.drag)
            document.removeEventListener("touchmove", this.drag)
        }
    }

    drag = e => {
        e.preventDefault()

        let cancel = false

        if (this.hooks.mousemove.length)
            for (let cb of this.hooks.mousemove)
                cancel |= cb(e)

        if (cancel) return

        this.onmousemove(e)
    }

    onmousedown(e) {
        this.previous = [e.clientX, e.clientY]
        this.parent.setAttribute("data-dragged", "data-dragged")

        document.addEventListener("mousemove", this.drag)
        document.addEventListener("touchmove", this.drag)
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
    remove_hook(event, cb) {
        if (this.hooks.hasOwnProperty(event))
            if (this.hooks[event].includes(cb))
                this.hooks[event].splice(this.hooks[event].indexOf(cb), 1)
    }
}
