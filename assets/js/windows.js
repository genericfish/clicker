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
    })

    set_theme(window.localStorage["theme"] || "xp")
})()