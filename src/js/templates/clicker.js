(() => {
    let win = H.WM.get("khoima clicker")

    let gamergoo = document.createElement("div")
    let counter = document.createElement("div")
    let cps = document.createElement("div")
    let span = document.createElement("span")

    gamergoo.id = "gamergoo"
    counter.id = "counter"
    span.innerHTML = "gamergoo"
    cps.id = "cps"
    cps.classList.add("rate")

    gamergoo.appendChild(counter)
    gamergoo.appendChild(span)
    gamergoo.appendChild(cps)

    win.body.append(gamergoo)

    let clicker = document.createElement("div")
    let input = document.createElement("input")

    clicker.id = "clicker"

    input.id = "kfc"
    input.type = "button"

    clicker.appendChild(input)

    win.appendChild(clicker)
})()