class ThemeManager {
    constructor () {
        this.background = document.getElementById("background")
        this.theme = document.getElementById("theme")

        this.set_theme(window.localStorage["theme"] || "xp")
    }

    set_theme(theme) {
        if (theme === "xp") this.background.setAttribute("class", "xp")
        else if (theme === "98") this.background.setAttribute("class", "w98")
        else return

        document.body.classList = theme
        window.localStorage["theme"] = theme
        this.theme.setAttribute("href", `https://unpkg.com/${theme}.css`)
    }

    toggle() {
        let current = window.localStorage["theme"] || "xp"

        this.set_theme((current === "98") ? "xp" : "98")
    }
}