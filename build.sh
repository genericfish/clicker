#!/bin/bash

lessc="./node_modules/.bin/lessc"
minify="./node_modules/.bin/minify"

mkdir -p "./dist/assets/js/workers"
mkdir -p "./dist/assets/images"

if [ -d ./src/js ] && [ -d ./dist/assets/js ]; then
    touch ./dist/assets/js/clicker.js
    cmd="${minify} ./src/js/core/keyhandler.js ./src/js/desktop/windows.js\
    ./src/js/desktop/desktop.js ./src/js/khoima.js ./src/js/minesweeper.js"
    eval "${cmd} > ./dist/assets/js/game.js"
    echo "Minified ./src/js/*.js to ./dist/assets/js/game.js"
    unset cmd

    for f in ./src/js/workers/*; do
        touch "./dist/assets/js/workers/${f##*/}"
        eval "${minify} ${f} > ./dist/assets/js/workers/${f##*/}"
        echo "Minified ${f} to ./dist/assets/js/workers/${f##*/}"
    done

    unset f
else
    echo "Missing either ./src/js or ./dist/assets/js, check file/directory permissions."
fi

if [ -d ./src/styles ] && [ -d ./dist/assets ]; then
    touch ./dist/assets/clicker.css
    touch ./dist/index.html

    eval "${lessc} ./src/styles/clicker.less | ${minify} --css > ./dist/assets/clicker.css"
    echo "Compiled ./src/styles/clicker.less and minified to ./dist/assets/clicker.css"

    eval "${minify} ./src/index.html > ./dist/index.html"
    echo "Minified ./src/index.html to ./dist/index.html"
else
    echo "Missing either ./src/styles or ./dist/assets, check file/directory permissions."
fi

if [ -f changelog.txt ]; then
    cat changelog.txt > ./dist/changelog.txt
    echo "Copied ./changelog.txt to ./dist/changelog.txt"
else
    echo "Missing changelog.txt."
fi

if [ -d ./images ] && [ -d ./dist/assets/images ]; then
    cp -r ./images ./dist/assets
    echo "Copied ./images to ./dist/assets/images"
else
    echo "Missing ./images or ./dist/assets/images, check file/directory permissions."
fi

unset lessc
unset minify
