const strings = {
    shop: {
        towers: {
            header: "%s stats",
            rate: "gamergoo per second: +%s",
            click: "gamergoo per click: +%s",
            desc: "%s",
            owned: "%s currently owned",
            producing: "producing %s gamergoo per second"
        },
        minigames: {
            header: "%s",
            desc: "%s",
            rate: "",
            click: "",
            owned: ["Purchase now!", "You already own %s"],
            producing: ""
        }
    }
}

function string(path, content) {
    let str = strings

    path.split('/').forEach(p => p ? str = str[p] : null)

    if (str == undefined)
        return console.error(`[Strings] Invalid path "${path}".`)

    if (str instanceof Array) return str

    if (content instanceof Array)
        content.forEach(repl => str.replace("%s", repl))
    else
        return str.replace("%s", content)
}