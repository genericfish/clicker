class Desktop {
    constructor () {
        this.background = document.getElementById("background")
        new Selection(this.background)
    }
}

class Icon {
    constructor (display, window, src, ondblclick) {
        this.display = display
        this.src = src
        this.ondblclick = ondblclick || `H.WM.maximize("${window.id}")`

        document.getElementById("desktop").appendChild(this.create())
    }

    create() {
        let icon = document.createElement("div")

        let link = document.createElement("a")

        let img = document.createElement("img")
        let span = document.createElement("span")

        link.appendChild(img)
        link.appendChild(span)

        icon.appendChild(link)

        icon.classList.add("icon")

        link.href = "#"
        link.setAttribute("ondblclick", this.ondblclick)

        img.src = this.src

        span.innerHTML = this.display

        this.icon = icon

        return icon
    }
}

class App {
    constructor (
        title = "", x = -1, y = -1, src = "", display = "",
        s = 0, z = H.WM.length, iframe = false
    ) {
        this.window = new Window(title, x, y, s, z, iframe)

        if (display == undefined || display == "") display = title
        if (src != undefined && src != "")
            this.icon = new Icon(display, this.window, src)
    }
}