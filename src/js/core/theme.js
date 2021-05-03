class ThemeManager {
    constructor () {
        this.background = document.getElementById("background")
        this.theme = document.getElementById("theme")

        this.set_theme(window.localStorage["theme"] || "xp")
    }

    set_theme(theme) {
        let name = theme
        if (theme === "98")
            name = "w98"
        else if (theme !== "xp")
            return

        this.background.setAttribute("class", name)

        document.body.classList = theme
        window.localStorage["theme"] = theme
        this.theme.setAttribute("href", `https://unpkg.com/${theme}.css`)
    }

    toggle = _ => {
        let current = window.localStorage["theme"] || "xp"

        this.set_theme((current === "98") ? "xp" : "98")
    }
}
