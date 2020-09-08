if not exist node.exe (
    call \code\Programs\node\nodevars.bat
)
\code\Programs\vscode\code.exe %*  --disable-gpu .