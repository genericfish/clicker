call terser .\assets\js\khoima-worker.js > .\dist\assets\js\khoima-worker.js
call terser .\assets\js\khoima.js > .\dist\assets\js\khoima.js
call terser .\assets\js\windows.js > .\dist\assets\js\windows.js
call terser .\assets\js\minesweeper.js > .\dist\assets\js\minesweeper.js
call minify .\assets\styles\khoima.css > .\dist\assets\styles\khoima.css
call minify .\assets\styles\windows.css > .\dist\assets\styles\windows.css
call minify index.html > .\dist\index.html
xcopy changelog.txt .\dist\changelog.txt /Y
xcopy /s .\assets\images .\dist\assets\images /Y