_ = (() => {
    let win = H.WM.get("changelog")
    let iframe = document.createElement("iframe")

    iframe.id = "changelog"
    iframe.src = "/changelog.txt"
    iframe.style.border = "none"

    win.appendChild(iframe)
})()
