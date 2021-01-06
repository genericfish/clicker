#!/bin/bash

lessc="./node_modules/.bin/lessc"
minify="./node_modules/.bin/minify"
babel="./node_modules/.bin/babel"

mkdir -p "./dist/assets/js/workers"
mkdir -p "./dist/assets/images"

eval "${babel} ./src -d ./babel"

if [ -d ./babel/js ] && [ -d ./dist/assets/js ]; then
    touch ./dist/assets/js/game.js

    templates=""
    for f in ./babel/js/templates/*.js; do
        templates="${templates} ${f}"
    done

    cmd="${minify} ./babel/js/core/drag.js ./babel/js/core/keyhandler.js\
    ./babel/js/core/windows.js ./babel/js/core/desktop.js\
    ./babel/js/programs.js ${templates} ./babel/js/khoima.js ./babel/js/minesweeper.js"

    eval "${cmd} > ./dist/assets/js/game.js"
    echo "Minified all core, game, and template JS files to ./dist/assets/js/game.js"
    unset cmd

    for f in ./babel/js/workers/*.js; do
        touch "./dist/assets/js/workers/${f##*/}"
        eval "${minify} ${f} > ./dist/assets/js/workers/${f##*/}"
        echo "Minified ${f} to ./dist/assets/js/workers/${f##*/}"
    done

    unset f
else
    echo "Missing either ./babel/js or ./dist/assets/js, check file/directory permissions."
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
    cp changelog.txt ./dist/changelog.txt
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
