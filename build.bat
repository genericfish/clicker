call terser .\assets\js\workers\clicker.js > .\dist\assets\js\workers\clicker.js
call terser .\assets\js\windows.js ^
            .\assets\js\khoima.js ^
            .\assets\js\minesweeper.js ^
            > .\dist\assets\js\game.js
call lessc .\assets\styles\clicker.less | call  minify --css > .\dist\assets\clicker.css
call minify index.html > .\dist\index.html
xcopy changelog.txt .\dist\changelog.txt /Y
xcopy /s .\assets\images .\dist\assets\images /Y