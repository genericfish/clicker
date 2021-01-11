const MAX_INT = new Uint32Array(1).fill(-1)[0] + 1

function random(min, max, safe = false) {
    if (max == undefined) {
        max = min
        min = 0
    }

    let val = ((self.crypto ?
        self.crypto.getRandomValues(new Uint32Array(1))[0] / MAX_INT :
        Math.random()) * (max - min + 1) + min)

    return safe ? Math.trunc(val) : ~~val
}