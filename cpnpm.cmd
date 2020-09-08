if not exist node.exe (
    call \code\Programs\node\nodevars.bat
)
pnpm  %* --registry=https://registry.npm.taobao.org --cache=$HOME/.npm/.cache/cnpm --disturl=https://npm.taobao.org/dist --userconfig=$HOME/.cnpmrc