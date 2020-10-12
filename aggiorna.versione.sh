#!/bin/bash
## VERSIONE GIT_VERSION AUTOMATICA
GIT_VERSION=$(git describe --dirty --always --tags)
echo "Ultimo tag $GIT_VERSION"
if ! [[ $GIT_VERSION =~ .*dirty.* ]]; then 
    BASE=${GIT_VERSION:0:3}
    printf -v TAG '%03X' $((0x1 + 0x$BASE))
    read -e -p "Commit con il tag '$TAG' [N/y]? " RISPOSTA 
    if [[ $RISPOSTA == "y" ]]; then
        COMANDO="s/\(v=\)\([a-fA-F0-9]\+\)/\1$TAG/"
        INDEX="index.html"
        sed -i "$COMANDO" $INDEX
        git commit -m "Cambiata automaticamente versione $TAG  delle chiamate javascript con il commit $GIT_VERSION " $INDEX 
        # Aggiungo il tag $TAG
        git tag -a $TAG -m "Versione $TAG" 
        # mostro il tag 
        git show $TAG
    fi
else
    echo "Git dirty status, committare prima"    
    git status -s
fi
