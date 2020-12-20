call terser .\src\js\workers\clicker.js > .\dist\assets\js\workers\clicker.js
call terser .\src\js\windows.js ^
            .\src\js\khoima.js ^
            .\src\js\minesweeper.js ^
            > .\dist\assets\js\game.js
call lessc .\src\styles\clicker.less | call  minify --css > .\dist\assets\clicker.css
call minify index.html > .\dist\index.html
xcopy changelog.txt .\dist\changelog.txt /Y
xcopy /s .\images .\dist\assets\images /Y