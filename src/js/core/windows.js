const themes = (() => {
    function set_theme(theme) {
        let background = document.getElementById("background")

        if (theme === "xp")
            background.setAttribute("class", "xp")
        else if (theme === "98")
            background.setAttribute("class", "w98")
        else
            return

        document.body.classList = theme
        window.localStorage["theme"] = theme
        document.getElementById("theme").setAttribute("href", `https://unpkg.com/${theme}.css`)
    }

    set_theme(window.localStorage["theme"] || "xp")

    return {
        toggle: () => {
            let current = window.localStorage["theme"] || "xp"

            current = (current === "98") ? "xp" : "98"

            set_theme(current)
        }
    }
})()

const desktop = (() => {
    let bg = document.getElementById("background")
    let sel = undefined
    let start = undefined

    document.addEventListener("mousedown", e => {
        if (e.target != bg) return

        sel = document.createElement("div")
        sel.classList = "selection"
        bg.appendChild(sel)
        sel.style.top = e.clientY + "px"
        sel.style.left = e.clientX + "px"
        start = [e.clientX, e.clientY]
    })

    document.addEventListener("mousemove", e => {
        if (start == undefined) return

        let box = sel.getBoundingClientRect()
        let w, h

        if (e.clientX <= start[0]) {
            sel.style.right = (window.innerWidth - start[0]) + "px"
            sel.style.left = null
            w = box.right - e.clientX
        } else {
            sel.style.left = start[0] + "px"
            sel.style.right = null
            w = box.left - e.clientX
        }

        if (e.clientY <= start[1]) {
            sel.style.bottom = (window.innerHeight - start[1]) + "px"
            sel.style.top = null
            h = box.bottom - e.clientY
        } else {
            sel.style.top = start[1] + "px"
            sel.style.bottom = null
            h = box.top - e.clientY
        }

        sel.style.width = Math.abs(w) + "px"
        sel.style.height = Math.abs(h) + "px"
    })

    document.addEventListener("mouseup", () => {
        if (start == undefined) return

        try {
            sel.classList.add("fade")

            setTimeout(() => {
                bg.removeChild(sel)
                start = undefined
            }, 75)
        } catch (e) { }
    })
})()

function set_video() {
    let link = document.getElementById("link").value || "https://www.youtube.com/watch?v=dGQtL1l5i0Q"
    let url = new URL(link)

    if (url.host === "youtube.com" || url.host === "www.youtube.com") {
        let video = "dGQtL1l5i0Q"

        if (url.search)
            video = url.search.split("=")[1]

        document.getElementById("browser").src = "https://www.youtube.com/embed/" + video
    }
}

H.KH.set_bind(["control", "shift", "z"], themes.toggle)
//H.KH.set_bind(["control", "shift", "x"], win.reset)

class WindowManager {
    constructor () {
        this._wm_ver = 1
        this.windows = { }
        this.generated = 0
    }

    add(win) { this.windows[win.id] = win }

    exit(e) { this.windows[this.decode(e)].exit() }
    minimize(e) { this.windows[this.decode(e)].minimize() }
    maximize(e) {
        let id = this.decode(e)

        this.windows[id].maximize()
        this.focus(id)
    }

    decode(e) {
        let id = e
        if (e instanceof Element)
            id = e.parentElement.parentElement.parentElement.getAttribute("window")
        if (e instanceof Window)
            id = e.id

        return id
    }

    focus(w) {
        if (w instanceof Window) w = w.id
        if (this.windows[w].z == this.length) return

        this.windows[w].focus()
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
        if (typeof v === "number") return this.length < v ? this.entries[v][1] : null

        let b64 = window.btoa(v)
        return this.windows.hasOwnProperty(b64) ? this.windows[b64] : null
    }

    generate() {
        return {
            x: 100 + 20 * ++this.generated,
            y: 5 + 65 * this.generated
        }
    }

    get entries() { return Object.entries(this.windows)}
    get length() { return this.entries.length }

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

        if (iframe) {
            this.drag.add_hook("mousedown", _ => { this.overlay.style.pointerEvents = "none" })
            this.drag.add_hook("mouseup", _ => {
                this.overlay.style.pointerEvents = "auto"
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
        this.drag = new Drag(bar, win)

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

        buttons[1].setAttribute("aria-label", "Maximize")
        buttons[1].setAttribute("onclick", "H.WM.maximize(this)")

        buttons[2].setAttribute("aria-label", "Close")
        buttons[2].setAttribute("onclick", "H.WM.exit(this)")

        buttons.forEach(e => controls.appendChild(e))

        bar.appendChild(controls)

        // Window body
        let body = document.createElement("div")
        body.classList.add("window-body")

        // Append children to root window elementqqq
        win.appendChild(bar)
        win.appendChild(body)

        // Add to window manager
        H.WM.add(this)

        win.setAttribute("window", this.id)
        document.getElementById("desktop").appendChild(win)

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
    get z() { return this.win.style.zIndex || 0 }
    get s() { return this._state }

    set state(s) { ({x: this.x, y: this.y, z: this.z, s: this.s} = s) }
    get state() { return {x: this.x, y: this.y, z: this.z, s: this.s} }

    get body() { return this.win.children[1] }
}

H.WM = new WindowManager()