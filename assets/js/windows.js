const windows = [
    null,
    document.getElementById("window-1"),
    document.getElementById("window-2"),
    document.getElementById("window-3")
]

function minimize(win) {
    windows[win].classList.add("minimize")
}

function maximize(win) {
    windows[win].classList.remove("minimize")
}

(() => {
    function set_theme(theme) {
        let background = document.getElementById("background")

        if (theme === "xp")
            background.setAttribute("class", "xp")
        else if (theme === "98")
            background.setAttribute("class", "w98")
        else
            return

        window.localStorage["theme"] = theme
        document.getElementById("theme").setAttribute("href", `https://unpkg.com/${theme}.css`)
    }

    function toggle_theme() {
        let current = window.localStorage["theme"] || "xp"

        current = (current === "98") ? "xp" : "98"

        set_theme(current)
    }

    document.addEventListener("keydown", e => {
        if (e.key === "f") toggle_theme()
        if (e.key === "g") {
            window.localStorage["windows"] = window.btoa(JSON.stringify({
                positions: [null, [5,5], [375,5], [895,5]],
                focus: [null, 3, 2, 1]
            }))

            set_windows()
        }
    })

    set_theme(window.localStorage["theme"] || "xp")

    function set_windows() {
        let data = {
            positions: [null, [5,5], [375,5], [895,5]],
            focus: [null, 3, 2, 1]
        }

        if (window.localStorage["windows"] == undefined)
            window.localStorage["windows"] = window.btoa(JSON.stringify(data))
        else
            data = JSON.parse(window.atob(window.localStorage["windows"]))

        for (let w in windows) {
            if (w == 0) continue

            let parent = windows[w].parentElement

            parent.style.left = data.positions[w][0] + "px"
            parent.style.top = data.positions[w][1] + "px"
            parent.style.zIndex = data.focus[w]
        }

        return data
    }

    function draggable() {
        let data = set_windows()

        for (let w in windows) {
            let display = windows[w]
            if (display == null) continue

            let parent = display.parentElement
            let titlebar = parent.children[0]

            parent.addEventListener("mousedown", () => {
                if (data.focus[w] != 3) {
                    data.focus[w] = 4

                    for (let f in data.focus) {
                        if (data.focus[f] == null || data.focus[f] <= 0) continue

                        windows[f].parentElement.style.zIndex = --data.focus[f]
                    }

                    window.localStorage["windows"] = window.btoa(JSON.stringify(data))
                }
            })

            let drag = (() => {
                let previous = [0, 0]

                function do_drag(e) {
                    data.positions[w] = [
                        parent.offsetLeft - previous[0] + e.clientX,
                        parent.offsetTop - previous[1] + e.clientY
                    ]

                    data.focus[w] = 3

                    previous = [e.clientX, e.clientY]

                    parent.style.left = data.positions[w][0] + "px"
                    parent.style.top = data.positions[w][1] + "px"
                }

                titlebar.addEventListener("mousedown", e => {
                    e.preventDefault()
                    previous = [e.clientX, e.clientY]

                    document.addEventListener("mousemove", do_drag)
                })

                document.addEventListener("mouseup", () => {
                    document.removeEventListener("mousemove", do_drag)

                    window.localStorage["windows"] = window.btoa(JSON.stringify(data))
                })
            })

            drag()
        }
    }

    draggable()
})()