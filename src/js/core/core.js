const H = {
    KH: new KeyHandler(),
    TM: new ThemeManager(),
    WM: new WindowManager(),
    D: new Desktop()
}
let _ = ""

document.addEventListener("contextmenu", e => e.preventDefault())

H.KH.set_bind(["control", "shift", "x"], _ => {
    for (let [_, w] of H.WM.entries)
        w.state = w.initial

    H.WM.maximize(H.WM.get("tutorial"))
    H.WM.save()
})
H.KH.set_bind(["control", "shift", "z"], H.TM.toggle)

// Generate the windows for each "program"
new Window("tutorial", 525, 200)
new Window("khoima clicker", 100, 5)
new Window("shop", 476, 5)
new Window("buildings", 1155, 5).win.style.minWidth = "495px"
new Window("changelog", -1, -1, 2, H.WM.length, true)
new Window("firekhoi", -1, -1, 2, H.WM.length, true)
new Window("khoisweeper", -1, -1, 2)
new Window("vending machine", -1, -1, 2)

H.WM.focus(H.WM.focused)
