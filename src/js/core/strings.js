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

const english_numbers = [
    "million",
    "billion",
    "trillion",
    "quadrillion",
    "quintillion",
    "sextillion",
    "septillion",
    "octillion",
    "nonillion",
    "undecillion",
    "duodecillion",
    "tredecillion",
    "quattuordecillion",
    "quindecillion",
    "sexdecillion"
    // septendecillion = 10^54, however JS safe upperlimit is 10^53 - 1
]

function nice_format(num) {
    let digits = Math.floor(Math.log10(num))

    if (digits < 6) return num

    let place = Math.floor((digits - 6) / 3)
    return (num / (10 ** (3 * Math.floor(digits / 3)))).toFixed(3) +
        " " + english_numbers[place]
}

function string(path, content) {
    let str = strings

    path.split('/').forEach(p => p ? str = str[p] : null)

    if (str == undefined)
        return console.error(`[Strings] Invalid path "${path}".`)

    if (str instanceof Array)
        return str

    if (content instanceof Array)
        content.forEach(repl => str.replace("%s", repl))
    else
        return str.replace("%s", content)
}