class KeyHandler {
    constructor() {
        this.keys = {}
        this.binds = {}

        document.addEventListener("keydown", e => {
            this.keys[e.key.toLowerCase()] = true
            this.check_binds()
        })
        document.addEventListener("keyup", e => { delete this.keys[e.key.toLowerCase()] })
    }

    pressed(keys) {
        let is_pressed = true

        for (let key of keys)
            is_pressed &= this.keys.hasOwnProperty(key)

        return is_pressed
    }

    set_bind(keys, action, win = '*') {
        if (keys instanceof Array)
            keys = keys.join('+')

        keys = keys.replace(/\s/g,'')

        if (this.binds.hasOwnProperty(keys))
            console.log("Overwriting keybind:", keys)

        this.binds[keys] = { [win]: action }

        console.log(`[KeyHandler] Added bind "${keys}" for window "${win}"`)
    }

    unset_bind(keys) {
        if (!this.binds.hasOwnProperty(keys))
            return

        console.log("Unsetting keybind:", keys)

        delete this.binds[keys]
    }

    check_binds() {
        for (let bind of Object.keys(this.binds))
            if (bind.split('+').reduce((acc, cur) => acc && this.keys.hasOwnProperty(cur), true)) {
                if (this.binds[bind].hasOwnProperty(H.WM.focused.id))
                    this.binds[bind][H.WM.focused.id]()

                if (this.binds[bind].hasOwnProperty('*'))
                    this.binds[bind]['*']()
            }
    }

    k() { return this.keys }
}
