const windows = [
    null,
    document.getElementById("window-1"),
    document.getElementById("window-2"),
    document.getElementById("window-3"),
    document.getElementById("window-4"),
    document.getElementById("window-5"),
]

const win = (() => {
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

    let default_window = {
        positions: [null, [110,5], [485,5], [975,5], [5,562], [130,90]],
        focus: [null, 5, 4, 3, 2, 1],
        status: [null, 0, 0, 0, 0, 2]
    }

    document.addEventListener("keydown", e => {
        if (e.key === "f") toggle_theme()
        if (e.key === "g") {
            window.localStorage["windows"] = window.btoa(JSON.stringify(default_window))

            set_windows()
        }
    })

    set_theme(window.localStorage["theme"] || "xp")

    let data = Object.assign({}, default_window)

    function set_windows() {
        if (window.localStorage["windows"] == undefined)
            save()
        else
            data_load = JSON.parse(window.atob(window.localStorage["windows"]))

        if (data.positions.length == data_load.positions.length)
            data = Object.assign(data, data_load)
        else save()

        for (let w in windows) {
            if (w == 0) continue

            let parent = windows[w].parentElement

            parent.style.left = data.positions[w][0] + "px"
            parent.style.top = data.positions[w][1] + "px"
            parent.style.zIndex = data.focus[w]

            if (data.status[w] == 1)
                minimize(w)
            else if (data.status[w] == 2)
                exit(w)
        }
    }

    function save() {
        window.localStorage["windows"] = window.btoa(JSON.stringify(data))
    }

    function minimize(win) {
        windows[win].classList.add("minimize")
        windows[win].style.visibility = "hidden"

        data.status[win] = 1
        save()
    }

    function maximize(win) {
        windows[win].classList.remove("minimize")
        windows[win].parentElement.style.visibility = "visible"
        windows[win].style.visibility = "visible"

        set_focus(win)
        data.status[win] = 0
        save()
    }

    function exit(win) {
        windows[win].parentElement.style.visibility = "hidden"
        windows[win].style.visibility = "hidden"

        data.status[win] = 2
        save()
    }

    set_windows()

    function set_focus(w) {
        if (data.focus[w] != (windows.length - 1)) {
            data.focus[w] = windows.length

            for (let f in data.focus) {
                if (data.focus[f] == null || data.focus[f] <= 0) continue

                windows[f].parentElement.style.zIndex = --data.focus[f]
            }

            save()
        }
    }

    for (let w in windows) {
        let display = windows[w]
        if (display == null) continue

        let parent = display.parentElement
        let titlebar = parent.children[0]

        parent.addEventListener("mousedown", () => { set_focus(w) })

        let drag = (() => {
            let previous = [0, 0]

            function do_drag(e) {
                data.positions[w] = [
                    parent.offsetLeft - previous[0] + e.clientX,
                    parent.offsetTop - previous[1] + e.clientY
                ]

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

                save()
            })
        })

        drag()
    }


    return {
        minimize: minimize,
        maximize: maximize,
        exit: exit
    }
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