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

    set_bind(keys, action) {
        if (keys instanceof Array)
            keys = keys.join('+')

        keys = keys.replace(/\s/g,'')
        this.binds[keys] = action

        console.log("KEYHANDLER: ADDED", keys)
    }

    check_binds() {
        for (let bind of Object.keys(this.binds))
            if (bind.split('+').reduce(
                (acc, cur) => acc && this.keys.hasOwnProperty(cur)
            )) this.binds[bind]()
    }

    k() { return this.keys }
}

const KH = new KeyHandler()
document.addEventListener("contextmenu", e => e.preventDefault())