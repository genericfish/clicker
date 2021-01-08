#!/bin/bash

lessc="./node_modules/.bin/lessc"
minify="./node_modules/.bin/minify"
babel="./node_modules/.bin/babel"

rm -rf ./babel
rm -rf ./dist

mkdir -p "./dist/assets/js/workers"
mkdir -p "./dist/assets/images"

src="src"

if [ ${1-prod} != "debug" ]; then
eval "${babel} ./src -d ./babel"
src="babel"
fi

if [ -d "./${src}/js" ] && [ -d ./dist/assets/js ]; then
    touch ./dist/assets/js/game.js

    cmd="${minify} ./${src}/js/core/selection.js ./${src}/js/core/desktop.js ./${src}/js/core/theme.js\
    ./${src}/js/core/draggable.js ./${src}/js/core/keyhandler.js ./${src}/js/core/windows.js\
    ./${src}/js/core/core.js ./${src}/js/khoima.js"

    eval "${cmd} ./${src}/js/minigames/"*.js " > ./dist/assets/js/game.js"
    echo "Minified all non-worker JS files to ./dist/assets/js/game.js"
    unset cmd

    for f in "./${src}/js/workers/"*.js; do
        touch "./dist/assets/js/workers/${f##*/}"
        eval "${minify} ${f} > ./dist/assets/js/workers/${f##*/}"
        echo "Minified ${f} to ./dist/assets/js/workers/${f##*/}"
    done

    unset f
else
    echo "Missing either ./${src}/js or ./dist/assets/js, check file/directory permissions."
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

if [ ${1-prod} == "release" ]; then
    mv ./dist ./clicker
    zip -r9 "clicker-${2-MISSING_VER}.zip ./clicker"
    tar -cvzf "clicker-${2-MISSING_VER}.tar.gz ./clicker"
    mv ./clicker ./dist
    echo "Generated release zip and tar files."
fi


unset lessc
unset minify
unset babel
unset src