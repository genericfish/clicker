class WindowManager {
    constructor () {
        this._wm_ver = 1
        this.windows = { }
        this.generated = 0

        this.hooks = { exit: {}, minimize: {}, maximize: {}, focus: {}, load: {} }
    }

    add(win) { this.windows[win.id] = win }

    exit(e) {
        let win = this.decode(e)

        if (this.windows[win].s == 2) return

        this.execute_hooks("exit", win)
        this.windows[win].exit()
        this.save()
    }

    minimize(e) {
        let win = this.decode(e)

        if (this.windows[win].s == 1) return

        this.execute_hooks("minimize", win)
        this.windows[win].minimize()
        this.save()
    }

    maximize(e) {
        let win = this.decode(e)

        if (this.windows[win].s == 0) return

        this.execute_hooks("maximize", win)
        this.windows[win].maximize()
        this.focus(win)
        this.save()
    }

    add_hook(event, win, cb) {
        if (this.hooks.hasOwnProperty(event))
            if (!this.hooks[event].hasOwnProperty(win)) this.hooks[event][win] = [cb]
            else this.hooks[event][win].push(cb)
    }

    remove_hook(event, win, cb) {
        if (this.hooks.hasOwnProperty(event) && this.hooks[event].hasOwnProperty(win))
            if (this.hooks[event][win].includes(cb))
                this.hooks[event][win].splice(this.hooks[event][win].indexOf(cb), 1)
    }

    get_hooks(event, win) {
        if (this.hooks.hasOwnProperty(event) && this.hooks[event].hasOwnProperty(win))
            return this.hooks[event][win]

        return []
    }

    execute_hooks(event, win, propagate = true) {
        let hooks = this.get_hooks(event, win)

        if (!hooks.length) return

        for (let hook of hooks)
            if (!(hook() || propagate))
                break
    }

    decode(e) {
        let id = e
        if (e instanceof Element)
            id = e.parentElement.parentElement.parentElement.getAttribute("data-window")
        if (e instanceof Window)
            id = e.id

        return id
    }

    focus(w) {
        if (w instanceof Window) w = w.id

        this.windows[w].focus()

        if (this.windows[w].z == this.length) return

        this.execute_hooks("focus", w)

        this.windows[w].z = this.length

        for (let [id, win] of Object.entries(this.windows)) {
            if (id == w) continue

            if (win.z > 1) --win.z
            win.unfocus()
        }
    }

    save() {
        let s = {}
        for (let [id,w] of this.entries) s[id] = w.state

        this.data = s
    }

    load(w) {
        let data = this.data
        w = this.decode(w)

        if (!data.hasOwnProperty("version") || data.version != this._wm_ver)
            this.save()

        if (!data.hasOwnProperty(w)) return

        this.windows[w].state = data[w]
    }

    get(v) {
        if (v === null) return null

        if (typeof v === "number")
            if (v == -1){
                for (let [_,w] of this.entries)
                    if (w.z == this.length)
                        return w

                return null
            } else return (this.length < v || v < 0) ? null : this.entries[v][1]

        if (this.windows.hasOwnProperty(v)) return v

        let b64 = window.btoa(v)
        return this.windows.hasOwnProperty(b64) ? this.windows[b64] : null
    }

    generate() {
        return {
            x: 100 + 20 * ++this.generated,
            y: 5 + 65 * this.generated
        }
    }

    load_template(e) {
        if (!(e instanceof Element)) return
        let win = this.get(e.getAttribute("data-window"))
        let prefix = null

        if (win == null) return

        // Clone template content into window body
        win.appendChild(e.content.cloneNode(true))

        // Copy over template attributes to the window body
        for (let a of e.attributes) {
            let attr, val
            ({name: attr, value: val} = a)

            switch (attr) {
                case "data-window": break
                case "data-prefix":
                    prefix = val
                    break
                case "style":
                case "class":
                    let cur = win.body.getAttribute(attr)

                    win.body.setAttribute(attr, cur != null ? cur + val : val)
                    break
                case "id":
                    win.body.setAttribute(attr, val)
                    break
                default: break
            }
        }

        // Prefix all element IDs with the given prefix
        if (prefix != null) {
            this.prefix(win.win, prefix)
            win.prefix = prefix
        }

        this.execute_hooks("load", win.id)

        // Remove the template
        e.remove()
    }

    prefix(e, prefix) {
        for (let child of e.children) {
            this.prefix(child, prefix)

            if (child.id)
                child.id = `${prefix}-${child.id}`
        }
    }

    get entries() { return Object.entries(this.windows)}
    get length() { return this.entries.length }
    get focused() {
        for (let [_,w] of this.entries)
            if (w.z == this.length)
                return w

        return this.get(0)
    }

    set data(v) {
        v.version = this._wm_ver
        window.localStorage["windows2"] = window.btoa(JSON.stringify(v))
        this._data_cache = null
    }

    get data() {
        if (this._data_cache !== undefined && this._data_cache !== null) return this._data_cache
        this._data_cache = JSON.parse(window.atob(window.localStorage["windows2"] || "e30="))

        return this._data_cache
    }
}

class Window {
    constructor (title = "", x = -1, y = -1, s = 0, z = H.WM.length, iframe = false) {
        this.title = title
        this.overlay = undefined
        this.iframe = iframe
        this.id = window.btoa(title)

        this.create_window()

        if (x == -1 || y == -1) ({x: this.x, y: this.y} = H.WM.generate())
        else {
            this.x = x
            this.y = y
        }

        this.z = z
        this.s = s

        this.initial = this.state

        H.WM.load(this)

        this.win.addEventListener("mousedown", _ => { H.WM.focus(this) })
        this.win.addEventListener("touchstart", _ => { H.WM.focus(this) })

        if (iframe) {
            // Focus event on window set pointerEvents to "none", but we want "auto" if we
            // are dragging, use timeout.
            this.drag.add_hook("mousedown", _ => {
                setTimeout(_=>{ this.overlay.style.pointerEvents = "auto" }, 1)
            })
            this.drag.add_hook("mouseup", _ => {
                this.overlay.style.pointerEvents = "none"
                H.WM.save()
            })
        } else this.drag.add_hook("mouseup", _ => { H.WM.save() })
    }

    exit() {
        this.win.style.visibility = "collapse"
        this.win.children[1].style.visibility = "collapse"

        this._state = 2
    }

    minimize() {
        this.win.children[1].classList.add("minimize")
        this.win.children[1].style.visibility = "collapse"

        this._state = 1
    }

    maximize() {
        this.win.children[1].classList.remove("minimize")
        this.win.style.visibility = null
        this.win.children[1].style.visibility = null

        this._state = 0
    }

    focus() {
        if (this.iframe) this.overlay.style.pointerEvents = "none"
        this.win.classList.add("focused")
    }
    unfocus() {
        if (this.iframe) this.overlay.style.pointerEvents = "auto"
        this.win.classList.remove("focused")
    }

    create_window() {
        // Window container
        let win = document.createElement("div")
        win.classList.add("window")

        // Title bar
        let bar = document.createElement("div")
        bar.classList.add("title-bar")

        // Handle dragging on title bar
        this.drag = new Draggable(bar, win)

        // Title
        let title = document.createElement("div")
        title.innerHTML = this.title
        title.classList.add("title-bar-text")

        bar.append(title)

        // Window controls
        let controls = document.createElement("div")
        let buttons = [
            document.createElement("button"),
            document.createElement("button"),
            document.createElement("button")
        ]

        controls.classList.add("title-bar-controls")

        buttons[0].setAttribute("aria-label", "Minimize")
        buttons[0].setAttribute("onclick", "H.WM.minimize(this)")
        buttons[0].setAttribute("ontouchstart", "H.WM.minimize(this)")

        buttons[1].setAttribute("aria-label", "Maximize")
        buttons[1].setAttribute("onclick", "H.WM.maximize(this)")
        buttons[1].setAttribute("ontouchstart", "H.WM.maximize(this)")

        buttons[2].setAttribute("aria-label", "Close")
        buttons[2].setAttribute("onclick", "H.WM.exit(this)")
        buttons[2].setAttribute("ontouchstart", "H.WM.exit(this)")

        buttons.forEach(e => controls.appendChild(e))

        bar.appendChild(controls)

        // Window body
        let body = document.createElement("div")
        body.classList.add("window-body")

        // Append children to root window element
        win.appendChild(bar)
        win.appendChild(body)

        // Add to window manager
        H.WM.add(this)

        win.setAttribute("data-window", this.id)
        document.getElementById("windows").appendChild(win)

        this.win = win

        this.add_overlay()
    }

    add_overlay() {
        // Invisible div that overlays entire window body
        // Workaround for focusing cross origin iframes
        if (!this.iframe) return

        let overlay = document.createElement("div")
        overlay.classList.add("ifoverlay")

        overlay.addEventListener("click", e => {
            H.WM.focus(this)

            // Window body has no content when overlay element is created
            // Therefore, must search for iframes on click
            for (let child of this.win.children[1].children)
                if (child.tagName === "IFRAME")
                    child.contentWindow.postMessage(e)
        })

        this.appendChild(overlay)
        this.overlay = overlay
    }

    appendChild(e) { this.win.children[1].appendChild(e) }

    get(s) { return document.getElementById((this.prefix ? this.prefix + '-' : '') + s) }

    set x(v) { this.win.style.left = v + "px" }
    set y(v) { this.win.style.top = v + "px" }
    set z(v) { this.win.style.zIndex = v }
    set s(v) {
        if (v == 0) this.maximize()
        else if (v == 1) this.minimize()
        else if (v == 2) this.exit()

        this._state = v
    }

    get x() { return this.win.style.left.replace("px", "") }
    get y() { return this.win.style.top.replace("px", "") }
    get z() { return parseInt(this.win.style.zIndex) || 0 }
    get s() { return this._state }

    set state(s) { ({x: this.x, y: this.y, z: this.z, s: this.s} = s) }
    get state() { return {x: this.x, y: this.y, z: this.z, s: this.s} }

    get body() { return this.win.children[1] }
}
