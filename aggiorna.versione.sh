#!/bin/bash
## VERSIONE GIT_VERSION AUTOMATICA
GIT_VERSION=$(git describe --dirty --always --tags)
echo "Ultimo tag $GIT_VERSION"
if ! [[ $GIT_VERSION =~ .*dirty.* ]]; then 
    read -e -p "Commit con il  precendente '$GIT_VERSION' nella versione delle chiamate javascript [N/y]? " RISPOSTA 
    if [[ $RISPOSTA == "y" ]]; then
        COMANDO="s/\(versione=\)\([a-fA-F0-9]\+\)/\1$GIT_VERSION/"
        INDEX="index.html"
        sed -i "$COMANDO" $INDEX
        git commit -m "Cambiata automaticamente versione delle chiamate javascript con il commit $GIT_VERSION" $INDEX 
        git diff HEAD^ HEAD $INDEX
    fi
else
    echo "Git dirty status, committare prima"    
    git status -s
fi
