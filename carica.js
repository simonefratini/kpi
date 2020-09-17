/// definizione globale delle variabili
var datasource_path='./datasource/';
Chart.defaults.global.legend.position = 'bottom' ;  
var selectProjectID='selectProject';
var peso = false;
// necessarie per distruggere i grafico vecchio
var barre = null;
var barre_team = null;
var ciambella = null;
var ciambella_group = null;
var ciambella_new = null;
var pila_bugs = null;


// funzione per recuperare i progetti/team ecc chiave valore semplice
function setSelect(source_json_file,select_id) {
    fetch(source_json_file)
        .then(response => response.json())
        .then( function (list) { 
            let selettore = document.getElementById(select_id);
            const objectArray = Object.entries(list);
            objectArray.sort(); // ordinamento
            objectArray.forEach ( function (v) {
                option = document.createElement("option");
                option.text = v[0];
                option.value = v[1];
                selettore.add(option);
            });
        });
}

// selezione dinamica sul select id (mettere this nella chiamata )
function changeSelect(e) {
    let selected_value = e.options[e.selectedIndex].value;
    if (e.id == selectProjectID) {
        popola_project(selected_value);
        popola_bugs(selected_value,peso);
    }
    else
        popola_team(selected_value);
};

// selezione dinamica sul checkbox
function changePriority(e) { 
    let s = document.getElementById(selectProjectID);
    popola_bugs(s.options[s.selectedIndex].value,e.checked);
};

function start() {
// popola le select all'avvio
setSelect(datasource_path+'project.json','selectProject');
setSelect(datasource_path+'group.json','selectGroup');
// popola dati con valori di tutti     
// id=0 equivale ad ALL
popola_project(0);
popola_team(0);
// peso = false equivale a tutti i bugs aperto
popola_bugs(0,0);
}

function popola_bugs(pid,peso) {
    if (ciambella_group != undefined)
        ciambella_group.destroy();
    if (ciambella != undefined)
        ciambella.destroy();
    if (ciambella_new != undefined)
        ciambella_new.destroy();
    if (pila_bugs != undefined)
        pila_bugs.destroy();
    openbugs(pid,peso);
    getTimestamp();
}


function popola_project(pid) {
    if (barre != undefined)
        barre.destroy();
    monthly_performance_chart(pid);
}

function popola_team(gid) {
    if (barre_team != undefined)
        barre_team.destroy();
    team_performance_chart(gid);
    team_performance_annuale(gid);
}

function getTimestamp() {
// funzione per recuperare il timestamp in cui e' avvenuta estrazione dei dati
fetch(datasource_path+'timestamp.json')
  .then(response => response.json())
  .then( function (d) { document.getElementById('timestamp').innerHTML = ' @ '+d.timestamp; }
  );
}

