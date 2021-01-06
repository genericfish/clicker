const H = {
    KH: new KeyHandler(),
    WM: new WindowManager()
}

document.addEventListener("contextmenu", e => e.preventDefault())

H.KH.set_bind(["control", "shift", "x"], H.WM.reset)
H.KH.set_bind(["control", "shift", "z"], themes.toggle)