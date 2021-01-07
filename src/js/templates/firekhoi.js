_ = (() => {
    let win = H.WM.get("firekhoi")
    let div = document.createElement("div")
    let button = document.createElement("button")
    let url = document.createElement("input")
    let iframe = document.createElement("iframe")

    url.id = "link"
    url.autocomplete = "off"
    url.type = "text"
    url.placeholder = "https://www.youtube.com/watch?v=uUnguqPxzNU"

    button.onclick="set_video()"
    button.innerHTML = "->"

    iframe.id = "browser"
    iframe.width = "560"
    iframe.height = "315"
    iframe.src = "https://www.youtube.com/embed/uUnguqPxzNU"
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    iframe.setAttribute("allowfullscreen", "allowfullscreen")
    iframe.style.border = "none"

    div.appendChild(url)
    div.appendChild(button)

    win.appendChild(div)
    win.appendChild(iframe)
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
