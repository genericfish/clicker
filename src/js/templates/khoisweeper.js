_ = (() => {
    let win = H.WM.get("khoisweeper")

    win.body.innerHTML =
    `<div id="ms-stats">` +
        `<select autocomplete="off" onchange="ms.difficulty(this.options[this.selectedIndex])">` +
            `<option value="1">Easy</option>` +
            `<option value="2" selected>Medium</option>` +
            `<option value="3">Hard</option>` +
        `</select>` +
        `<span style="color: #f00;">&#x2691;</span>x<span id="ms-flags">40</span>` +
        `| <span id="ms-time">0</span>s` +
        `<button onclick="ms.generate(-1)">Restart</button>` +
    `</div>` +
    `<div id="minesweeper"></div>`
})()
