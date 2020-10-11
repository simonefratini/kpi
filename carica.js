/// definizione globale delle variabili
var datasource_path='./datasource/';
Chart.defaults.global.legend.position = 'bottom' ;  
var selectProjectID='selectProject';
var is_high = false;
var advance_debug = false;
// necessarie per distruggere i grafico vecchio
var barre = null;
var barre_average = null;
var barre_team = null;
var barre_latency = null;
var ciambella = null;
var pila_bugs = null;
var stacked_bugs_by_team = null;

// funzione per generare un numero random per forzare il reload delle chiamate con fetch
function random_version() {
    return Math.round(Math.random()*1E+8);
}

// funzione per recuperare i progetti/team ecc chiave valore semplice
function setSelect(source_json_file,select_id) {
    fetch(source_json_file+'?v='+random_version())
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
        popola_project(selected_value,is_high);
        popola_bugs(selected_value,is_high);
    }
    else
        popola_team(selected_value, is_high);
};

// selezione dinamica sul checkbox della priorita'
function changePriority(e) { 
    let s = document.getElementById(selectProjectID);
    popola_bugs(s.options[s.selectedIndex].value,e.checked);
    popola_project(s.options[s.selectedIndex].value,e.checked);
    popola_team(s.options[s.selectedIndex].value,e.checked);
};



function start() {
// popola le select all'avvio
setSelect(datasource_path+'project.json','selectProject');
setSelect(datasource_path+'group.json','selectGroup');
// popola dati con valori di tutti     
// id=0 equivale ad ALL
popola_project(0,0);
popola_team(0,0);
// is_high = false equivale a tutti i bugs aperto
popola_bugs(0,0);
}


function setFocus() {
  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
  var target = $(e.target).attr("href") // activated tab
  if (target == '#project')  
    document.getElementById(selectProjectID).focus();
  else
    document.getElementById('selectGroup').focus();
});
}

function popola_bugs(pid, is_high) {
    if (ciambella != undefined)
        ciambella.destroy();
    if (pila_bugs != undefined)
        pila_bugs.destroy();
    if (stacked_bugs_by_team != undefined)
        stacked_bugs_by_team.destroy();
    openbugs(pid,is_high);
    getTimestamp();
}

function popola_project(pid, is_high) {
    if (barre != undefined)
        barre.destroy();
    if (barre_average != undefined)
        barre_average.destroy();
    monthly_performance_chart(pid, is_high);
    yearly_performance(pid, is_high);
}

function popola_team(gid, is_high) {
    if (barre_team != undefined)
        barre_team.destroy();
    if (barre_latency != undefined)
        barre_latency.destroy();
    team_performance_chart(gid, is_high);
    team_performance_annuale(gid, is_high);
}

function getTimestamp() {
// funzione per recuperare il timestamp in cui e' avvenuta estrazione dei dati
fetch(datasource_path+'timestamp.json'+'?v='+random_version())
  .then(response => response.json())
  .then( function (d) { document.getElementById('timestamp').innerHTML = ' @ '+d.timestamp; }
  );
}
