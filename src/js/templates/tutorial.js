_ = (() => {
    let win = H.WM.get("tutorial")

    win.body.style.width = "550px"
    win.body.style.padding = "10px"

    let paragraphs = [
        'In the <a href="#" onclick="H.WM.maximize(H.WM.get(\'khoima clicker\'))">khoima clicker</a> window, click the khoima in order to earn gamergoo.',
        'When you have enough gamergoo, you can buy buildings inside the <a href="#" onclick="H.WM.maximize(H.WM.get(\'shop\'))">shop.</a>',
        'After you buy buildings from the shop, they will appear in the <a href="#" onclick="H.WM.maximize(H.WM.get(\'buildings\'))">buildings</a> window.',
        'You can view the recent patchnotes in the <a href="#" onclick="H.WM.maximize(H.WM.get(\'changelog\'))">changelog</a>, or watch YouTube videos in <a href="#" onclick="H.WM.maximize(H.WM.get(\'firekhoi\'))">firekhoi.</a>',
        'Some buildings like <a href="#" onclick="H.WM.maximize(H.WM.get(\'khoisweeper\'))">khoisweeper</a> unlock minigames that can be accessed by the desktop icons.<br>',
        'You can also drag around these windows, and use the window control buttons to minimize, maximize, and close the windows.',
        'Use <b>CTRL+SHIFT+X</b> to reset the window positions back to default.',
        'Use <b>CTRL+SHIFT+Z</b> to switch between Windows XP and 98 themes.'
    ]

    for (let paragraph of paragraphs) {
        let p = document.createElement("p")
        p.innerHTML = paragraph
        win.appendChild(p)
    }

    win.body.innerHTML += `<button onclick="H.WM.exit('${win.id}')">Close Tutorial</button>`
})()
