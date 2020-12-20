# khoima clicker

Live game: [generic.fish/clicker](https://generic.fish/clicker)

## Compiling (Windows)
- Enable WSL2 and install emscripten sdk, binaryen
- On Windows install node, and run `npm i -g lessc minify`
- Run `.\build.bat`

You can also modify `build.bat` to run `lessc` and `minify` on WSL instead of installing node on both WSL and Windows.