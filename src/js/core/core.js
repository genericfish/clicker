const H = {
    KH: new KeyHandler(),
    TM: new ThemeManager(),
    WM: new WindowManager(),
    DE: new Desktop()
}

// Generate the windows for each "program"
new App("khoipedia", 525, 200, "assets/images/buildings/minesweeper.png")
new App("buildings", 1155, 5, "assets/images/buildings/autoclicker.png", "", 2)
    .window.win.style.minWidth = "495px"
new App("khoima clicker", 100, 5, "assets/images/gameplay/khoima.png")
new App("shop", 476, 5, "assets/images/buildings/water.png")
new App("changelog", -1, -1, "assets/images/buildings/text.png", "", 2, H.WM.length, true)
new App("firekhoi", -1, -1, "assets/images/buildings/firekhoi.png", "", 2, H.WM.length, true)
new App("khoisweeper", -1, -1, "assets/images/buildings/minesweeper.png", "khoi sweeper", 2)
new App("shenzhen solitaire", -1, -1, "assets/images/buildings/minesweeper.png", "", 2)

new Icon("discord", null, "https://discord.com/assets/41484d92c876f76b20c7f746221e8151.svg", "window.open('https://discord.gg/ZTnCdcM', '_blank')")

// Leading semicolon is required for the below to work
;(() => {
    let templates = Array.from(document.getElementsByTagName("template"))
    for (let template of templates)
        H.WM.load_template(template)
})()

H.WM.focus(H.WM.focused)

function init() {
    document.addEventListener("contextmenu", e => e.preventDefault())

    H.KH.set_bind(["control", "shift", "x"], _ => {
        for (let [_, w] of H.WM.entries)
            w.state = w.initial

        H.WM.maximize(H.WM.get("khoipedia"))
        H.WM.save()
    })
    H.KH.set_bind(["control", "shift", "z"], H.TM.toggle)

    Shenzhen()
    ms.generate(-1)
}
