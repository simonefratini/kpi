#!/bin/bash/env bats
# CONFIGURAZIONI 
load config
NOME="View"
#
REFPATH=../view/    
TEMP=/tmp/view/

@test "$NOME Prepare Environment" {
# controllo se esiste cartella 
if [ ! -d "$TEMP" ]; then
    mkdir $TEMP    
else
    # rimozione preventiva dei file dell'esecuzione precedente
    rm -f $TEMP*.output.html
fi
}
@test "$NOME curl home (index.html) " {
cd $TEMP
$CURL -f -s $WEBURL > "$TEMP"index.html
if [ "$?" -eq "0" ]; then
    $HTMLVALID index.html          
fi
[[ "$status" -eq 0 ]]
}

