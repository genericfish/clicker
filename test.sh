for f in ./src/js/*.js; do
    echo "${f##*/}"
done

unset f
