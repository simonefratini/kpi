/// definizione globale delle variabili
var datasource_path='./datasource/';
Chart.defaults.global.legend.position = 'bottom' ;  
Chart.defaults.global.legend.labels.usePointStyle = true ;  
var selectProjectID='selectProject';
var is_high = false;
var advance_debug = false;
// necessarie per distruggere i grafico vecchio
var barre = null;
var bar_bugs_average_to_close = null;
var bar_team_performance = null;
var bar_team_latency = null;
var doughnut_bugs_open_by_status = null;
var doughnut_bugs_priority = null;
var stacked_bugs_by_team = null;
var stacked_bugs_by_category = null;

// funzione per generare un numero random per forzare il reload delle chiamate con fetch
function random_version() { return Math.round(Math.random()*1E+8);
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
function popola_tutto() {
// popola dati con valori di tutti     
// is_high = o equivale a tutti i bugs aperto
// project_id=0 equivale ad ALL
// team_id = 0 equivale ad All Teams - One Company
let s = document.getElementById(selectProjectID);
let project_id = s.options[s.selectedIndex].value;
s = document.getElementById('selectGroup');
let team_id = s.options[s.selectedIndex].value;
popola_project(project_id,is_high);
popola_bugs(project_id,is_high);
popola_team(team_id,is_high);

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
    // setto variabile globale
    is_high = e.checked
    popola_tutto();
};

// selezione dinamica sul checkbox debug come variabile globale
function changeDebug(e) { 
    if (e.checked)
        window.alert('This is only for debug! Please, take care.');
    advance_debug = e.checked;
    popola_tutto();
};

function start() {
// popola le select all'avvio
setSelect(datasource_path+'project.json','selectProject');
setSelect(datasource_path+'group.json','selectGroup');
popola_tutto();
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
    if (doughnut_bugs_open_by_status != undefined)
        doughnut_bugs_open_by_status.destroy();
    if (doughnut_bugs_priority != undefined)
        doughnut_bugs_priority.destroy();
    if (stacked_bugs_by_team != undefined)
        stacked_bugs_by_team.destroy();
    if (stacked_bugs_by_category != undefined)
        stacked_bugs_by_category.destroy();
    openbugs(pid,is_high);
    getTimestamp();
}

function popola_project(pid, is_high) {
    if (barre != undefined)
        barre.destroy();
    if (bar_bugs_average_to_close != undefined)
        bar_bugs_average_to_close.destroy();
    monthly_performance_chart(pid, is_high);
    yearly_performance(pid, is_high);
}

function popola_team(gid, is_high) {
    if (bar_team_performance != undefined)
        bar_team_performance.destroy();
    if (bar_team_latency != undefined)
        bar_team_latency.destroy();
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
