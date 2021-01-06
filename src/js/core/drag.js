class Drag {
    constructor (interactive, parent) {
        if (!(interactive instanceof Element) || !(parent instanceof Element))
            throw new Exception("[Drag] Expected HTML Element.")

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
            this.previous = [e.clientX, e.clientY]

            if (this.hooks.mousedown.length)
                for (let cb of this.hooks.mousedown)
                    cb(e)

            document.addEventListener("mousemove", drag_func)
        })

        document.addEventListener("mouseup", e => {
            document.removeEventListener("mousemove", drag_func)

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