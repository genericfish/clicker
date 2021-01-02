@echo off
setlocal enableextensions

if not exist ".\dist\assets\js\workers" md .\dist\assets\js\workers
if not exist ".\dist\assets\images" md .\dist\assets\images

call terser .\src\js\workers\clicker.js > .\dist\assets\js\workers\clicker.js
call terser .\src\js\windows.js ^
            .\src\js\khoima.js ^
            .\src\js\minesweeper.js ^
            > .\dist\assets\js\game.js
call lessc .\src\styles\clicker.less | call  minify --css > .\dist\assets\clicker.css
call minify .\src\index.html > .\dist\index.html
xcopy changelog.txt .\dist\changelog.txt /Y
xcopy /s .\images .\dist\assets\images /Y
endlocal
