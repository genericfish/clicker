(() => {
    let win = H.WM.get("vending machine")
    let machine = document.createElement("div")
    machine.id = "machine"

    for (let i = 0; i < 5; i++) {
        let ul = document.createElement("ul")

        for (let j = 0; j < 5; j++) {
            let li = document.createElement("li")
            let span = document.createElement("span")

            span.innerHTML = "soda!"

            li.appendChild(span)
            ul.appendChild(li)
        }

        win.appendChild(ul)
    }
})()