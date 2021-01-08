#!/bin/bash

lessc="./node_modules/.bin/lessc"
minify="./node_modules/.bin/minify"
babel="./node_modules/.bin/babel"

mkdir -p "./dist/assets/js/workers"
mkdir -p "./dist/assets/images"

eval "${babel} ./src -d ./babel"

if [ -d ./babel/js ] && [ -d ./dist/assets/js ]; then
    touch ./dist/assets/js/game.js

    cmd="${minify} ./babel/js/core/selection.js ./babel/js/core/desktop.js ./babel/js/core/theme.js\
    ./babel/js/core/draggable.js ./babel/js/core/keyhandler.js ./babel/js/core/windows.js\
    ./babel/js/core/core.js ./babel/js/khoima.js"

    eval "${cmd}" ./babel/js/minigames/*.js " > ./dist/assets/js/game.js"
    echo "Minified all non-worker JS files to ./dist/assets/js/game.js"
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

if [ -d ./src/styles ] && [ -d ./dist/assets ] && [ -d ./src/templates ]; then
    touch ./dist/assets/clicker.css
    touch ./dist/index.html

    eval "${lessc} ./src/styles/clicker.less | ${minify} --css > ./dist/assets/clicker.css"
    echo "Compiled ./src/styles/clicker.less and minified to ./dist/assets/clicker.css"

    eval "cat " ./src/templates/*.html " |\
        sed -e '/<!-- o\/ templates here -->/{r /dev/stdin' -e 'd;}' ./src/index.html |\
        ${minify} --html\
        > ./dist/index.html"
    echo "Minified all templates and ./src/index.html into ./dist/index.html"

    unset f
    unset templates
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
