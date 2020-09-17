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


function openbugs(project_id, peso) {

    var TITLE='Open bugs';
    let file=datasource_path+'open_bugs.csv'
    d3.csv(file).then(function(rows) {
        // filtro sul progetto 
        if (project_id != 0  ) 
            rows = rows.filter(function(d) { return d.project_id == project_id; })
        // filtro sul peso  
        if (peso)
            // high=4, urgent = 5 and immediate = 7 //
            rows = rows.filter(function(d) { return (d.peso >=5 &&  d.peso <=7)})
        // uso il filtrato per la ciambella dei bugs di solo develpoment
        peso_bugs(rows);
        under_development_bugs_by_team(rows);
        new_bugs_by_team(rows);
        // aggregazione di tutti i progetti sulla data
        rows = d3.nest()
            .key(function(d) { return d.stato;})
            .rollup(function(v) { return d3.sum(v, function(d) { return d.bugs;})}) 
            .entries(rows)
        let colonne = [];
        let data = [];
        let TOTALE_APERTI= 0;
        rows.forEach(function (e) {
            colonne.push(e.key);
            data.push(e.value); 
            TOTALE_APERTI += parseInt(e.value);
        });
        let dati_ciambella  = { datasets : [ { data : data, backgroundColor: [ '#231964','#FFF014','lightgreen'] } ], labels: colonne };

        var ctx = document.getElementById('ciambella').getContext('2d');
        ciambella = new Chart(ctx, {
            type: 'doughnut',  // default  
            data: dati_ciambella ,
            options: {
                title: { display: true, text: TITLE },
                responsive: true,
                tooltips: { mode: 'label' },
                plugins : {
                    datalabels : {
                        render: 'value',
                        font: { 
                            size: '20' }, 
                    },
                    doughnutlabel: {
                        labels: [
                            {
                                text: TOTALE_APERTI,
                                font: { size: '30' }
                            },
                        ]
                    },
                }
            }
        });
    });
};


function under_development_bugs_by_team (rows) {
    var TITLE = 'Being fixed bugs by team';
    // filtro per stato 
    // attenzione la label  è statica!!! TODO
    rows = rows.filter(function(d) { return d.stato == "being fixed" });
    // aggregazione di tutti i progetti sulla data
    rows = d3.nest()
        .key(function(d) { return d.team;})
        .rollup(function(v) { return d3.sum(v, function(d) { return d.bugs;})}) 
        .entries(rows)
    // devo rimappare
    let colonne = [];
    let data = [];
    let TOTALE_APERTI= 0;
    rows.forEach(function (e) {
        colonne.push(e.key);
        data.push(e.value); 
        TOTALE_APERTI += parseInt(e.value);
    });
    let dati_ciambella = { datasets : [ { data : data , backgroundColor: [ 'lightblue','lightgreen','orange','green','red','pink','blue','magenta','brown','cyan'] } ], labels: colonne };
    var ctx = document.getElementById('ciambella_group').getContext('2d');
    ciambella_group = new Chart(ctx, {
        type: 'doughnut',  // default  
        data: dati_ciambella,
        options: {
            title: { display: true, text: TITLE },
            responsive: true,
            tooltips: { mode: 'label' },
            plugins : {
                datalabels : {
                    render: 'value',
                    font: { 
                        size: '20' }, 
                },
                doughnutlabel: {
                    labels: [
                        {
                            text: TOTALE_APERTI,
                            font: { size: '30' }
                        },
                    ]
                },
            }
        }
    });

}
function new_bugs_by_team (rows) {
    var TITLE = 'New bugs by team';
    // filtro per stato 
    // attenzione la label  è statica!!! TODO
    rows = rows.filter(function(d) { return d.stato == "new" });
    // aggregazione di tutti i progetti sulla data
    rows = d3.nest()
        .key(function(d) { return d.team;})
        .rollup(function(v) { return d3.sum(v, function(d) { return d.bugs;})}) 
        .entries(rows)
    // devo rimappare
    let colonne = [];
    let data = [];
    let TOTALE_APERTI= 0;
    rows.forEach(function (e) {
        colonne.push(e.key);
        data.push(e.value); 
        TOTALE_APERTI += parseInt(e.value);
    });
    let dati_ciambella = { datasets : [ { data : data , backgroundColor: [ 'lightblue','lightgreen','orange','green','red','pink','blue','magenta','brown','cyan'] } ], labels: colonne };
    var ctx = document.getElementById('ciambella_new').getContext('2d');
    ciambella_new = new Chart(ctx, {
        type: 'doughnut',  // default  
        data: dati_ciambella,
        options: {
            title: { display: true, text: TITLE },
            responsive: true,
            tooltips: { mode: 'label' },
            plugins : {
                datalabels : {
                    render: 'value',
                    font: { 
                        size: '20' }, 
                },
                doughnutlabel: {
                    labels: [
                        {
                            text: TOTALE_APERTI,
                            font: { size: '30' }
                        },
                    ]
                },
            }
        }
    });

}

function peso_bugs(rows) {
    var TITLE = 'Priority Bugs';
    // attenzione la label  è statica!!! TODO
    pesi = { 3 : 'Low',
             4 : 'Normal',
             5 : 'High',
             6 : 'Urgent',
             7 : 'Immediate',
            39 : 'Not set' }
            
    rows = d3.nest()
        .key(function(d) { return d.peso})
        .rollup(function(v) { return d3.sum(v, function(d) { return d.bugs;})}) 
        .entries(rows)
        // devo rimappare
    let colonne = [];
    let data = [];
    let TOTALE_APERTI = 0;
    rows.forEach(function (e) {
        colonne.push(pesi[e.key]);
        data.push(e.value); 
        TOTALE_APERTI += parseInt(e.value);
    });
    let dati_ciambella = { datasets : [ { data : data , backgroundColor: [ 'lightblue','lightgreen','orange','green','red','pink','blue','magenta','brown','cyan'] } ], labels: colonne };
    var ctx = document.getElementById('pila_bugs').getContext('2d');
    pila_bugs = new Chart(ctx, {
        type: 'doughnut',  // default  
        data: dati_ciambella,
        options: {
            title: { display: true, text: TITLE },
            responsive: true,
            tooltips: { mode: 'label' },
            plugins : {
                datalabels : {
                    render: 'value',
                    font: { 
                        size: '20' }, 
                },
                doughnutlabel: {
                    labels: [
                        {
                            text: TOTALE_APERTI,
                            font: { size: '30' }
                        },
                    ]
                },
            }
        }
    });
    
}

function monthly_performance_chart(project_id) {

    var TITLE = 'Monthly Performance Chart';
    var LABELS = 'mese';  // Column to define 'bucket' names (x axis)
    var SERIES = [  // For each column representing a series, define its name and color
        {
            column: 'aperti',
            name: 'Open in the month',
            color: 'lightblue'
        },
        {
            column: 'chiusi',
            name: 'Closed of opened bugs in the same month',
            color: '#FFF014'
        },
        {
            column: 'daytoclose',
            name: 'Average days open to Close',
            color: '#231964'
        }
    ];
    var Y_AXIS_1 = 'Bugs'; // y-axis label and label in tooltip
    var Y_AXIS_2 = 'Days'; // y-axis label and label in tooltip


    // Read data file and create a chart
    let file=datasource_path+'monthly_performance.csv';
    d3.csv(file).then(function(rows) {
        if (project_id != 0  ) { 
            // filtro sul progetto 
            rows = rows.filter(function(d) { return d.project_id == project_id; })
        }
        // aggregazione di tutti i progetti sulla data
        rows = d3.nest()
            .key(function(d) { return d.mese;})
            .rollup(function(v) { return {
                aperti: d3.sum(v, function(d) { return d.aperti;}),
                chiusi: d3.sum(v, function(d) { return d.chiusi;}),
                // arrotondo per eccesso al giorno superiore
                daytoclose: Math.ceil(d3.mean(v, function(d) { return d.daytoclose;}))
            }; })
            .entries(rows)
            // devo rimappare
            .map(function (g) {
                return {
                    mese: g.key,
                    aperti: g.value.aperti,
                    chiusi: g.value.chiusi,
                    daytoclose: g.value.daytoclose
                }
            });
        //
        let initialValue = 0;
        grand_total = {
            aperti : rows.reduce(function (a,c) { return a + c.aperti; }, initialValue),
            chiusi : rows.reduce(function (a,c) { return a + c.chiusi; }, initialValue),
            // prendo per la media delle medie solo quei mesi che hanno bugs, c.chiusi > 0 
            divisore_media : rows.reduce(function (a,c) {  return a + Math.sign(c.chiusi); }, initialValue),
            daytoclose : rows.reduce(function (a,c) { return a + c.daytoclose;}, initialValue),
        }
        grand_total.daytoclose = Math.ceil(grand_total.daytoclose / grand_total.divisore_media);

        var datasets = SERIES.map(function(el) {
            var type = 'bar';
            var yAxisID = 'y-axis-1';
            var order = 1;
            if (el.column == 'daytoclose') {
                type = 'line';
                yAxisID = 'y-axis-2';
                order =  0; 
            }
            return {
                label: el.name,
                labelDirty: el.column,
                backgroundColor: el.color,
           		borderColor: el.color,
                type : type,
                yAxisID : yAxisID,  
                fill : false,
                order: order,
                lineTension: 0,
                data: []
            }
        });

        rows.map(function(row) {
            datasets.map(function(d) {
                d.data.push(row[d.labelDirty])
            })
        });

        var barChartData = {
            labels : rows.map(function(el) { 
                moment.locale('en');
                return moment(el[LABELS]).format('MMM y');
            }),
            datasets: datasets,

        };

        var ctx = document.getElementById('barre').getContext('2d');
        barre = new Chart(ctx, {
            type: 'bar',  // default  
            data: barChartData,
            options: {
                plugins : {
                    datalabels: {
                        labels: { 
                            // escamotage per evitare sovrascrizioni della label
                            title: { color:null }
                        }
                    }
                },
                title: { display: true, text: TITLE },
                responsive: true,
                tooltips: { mode: 'label' },
                scales: {
                    xAxes: [{
                        scaleLabel: {
                            display: false,
                        },
                        gridLines: { display: true, },
                        ticks: {source: 'auto'},
                    }],
                    yAxes: [
                        {	
                            stacked: true,
                            position: 'right',
                            id: 'y-axis-2',
                            display: true,
                            scaleLabel: { display : true, labelString: Y_AXIS_2 },
                            gridLines: { display: true },
                            ticks: { precision: 0 }
                        }, {
                            stacked: false,
                            position: 'left',
                            id: 'y-axis-1',
                            display: true,
                            scaleLabel: { display : true, labelString: Y_AXIS_1 },
                            gridLines: { display: false },
                            ticks: { precision: 0 }
                        }
                    ]
                }

            }
        });

        // valori finali
        grand_total["totale"]=grand_total.aperti+grand_total.chiusi;
        var valori = [
            { 'id': 0,
            'label': 'Open in last 12 months',
            'value':  grand_total.aperti,
            'percent':  Math.round(100*grand_total.aperti/grand_total.totale)+'%',
                },
            { 'id': 1,
            'label': 'Closed of Opened in last 12 months',
            'value': grand_total.chiusi,
            'percent': Math.round(100*grand_total.chiusi/grand_total.totale)+'%',
                },
            { 'id': 2,
            'label': 'Total Bugs in last 12 months',
            'value':  grand_total.totale,
            'percent': '100%',    
                },
            { 'id': 4,
            'label': 'Average days to close a bugs', 

            'value':  grand_total.daytoclose,
            'percent': ' ' ,    
                },
        ];
        var $table = $('#table');
        $table.bootstrapTable({});
        $table.bootstrapTable("load",valori);
    });
}




function team_performance_chart(group_id) {

    var TITLE = 'Team Performance Chart';
    var LABELS = 'mese';  // Column to define 'bucket' names (x axis)
    var SERIES = [  // For each column representing a series, define its name and color
        {
            column: 'bugs',
            name: 'Bugs handle in the month',
            color: 'lightblue'

        },
        {
            column: 'unleash',
            name: 'Bugs moved or closed',
            color: '#FFF014'
        },
        {
            column: 'days',
            name: 'Average days handle in the month',
            color: '#231964'
        }
    ];
    var Y_AXIS_1 = 'Bugs'; // y-axis label and label in tooltip
    var Y_AXIS_2 = 'Days'; // y-axis label and label in tooltip
    // Read data file and create a chart
    let file=datasource_path+'team_performance.csv';
    d3.csv(file).then(function(rows) {
        if (group_id != 0  ) { 
            // filtro sul progetto 
            rows = rows.filter(function(d) { return d.group_id == group_id; })
        }
        // aggregazione di tutti i progetti sulla data
        rows = d3.nest()
            .key(function(d) { return d.mese;})
            .rollup(function(v) { return {
                bugs: d3.sum(v, function(d) { return d.bugs;}),
                stillown: d3.sum(v, function(d) { return (d.stillown) ;}),
                // arrotondo per eccesso al giorno superiore
                days: Math.ceil(d3.mean(v, function(d) { return d.days;}))
            }; })
            .entries(rows)
            // devo rimappare
            .map(function (g) {
                return {
                    mese: g.key,
                    bugs: g.value.bugs,
                    stillown: g.value.stillown, 
                    unleash: g.value.bugs - g.value.stillown,
                    days: g.value.days

                }
            });
        var datasets = SERIES.map(function(el) {
            var type = 'bar';
            var yAxisID = 'y-axis-1';
            var order = 1;
            if (el.column == 'days') {
                type = 'line';
                yAxisID = 'y-axis-2';
                order =  0; 
            }
            return {
                label: el.name,
                labelDirty: el.column,
                backgroundColor: el.color,
    			borderColor: el.color,

                type : type,
                yAxisID : yAxisID,  
                fill : false,
                order: order,
                lineTension: 0,
                data: []
            }
        });
        rows.map(function(row) {
            datasets.map(function(d) {
                d.data.push(row[d.labelDirty])
            })
        });
        var barChartData = {
            labels : rows.map(function(el) { 
                moment.locale('en');
                return moment(el[LABELS]).format('MMM y');
            }),
            datasets: datasets,

        };
        var ctx = document.getElementById('barre_team').getContext('2d');
        barre_team = new Chart(ctx, {
            type: 'bar',  // default  
            data: barChartData,
            options: {
                plugins : {
                    datalabels: {
                        labels: { 
                            // escamotage per evitare sovrascrizioni della label
                            title: { color:null }
                        }
                    }
                },
                title: { display: true, text: TITLE },
                responsive: true,
                tooltips: { mode: 'label' },
                scales: {
                    xAxes: [{
                        scaleLabel: {
                            display: false,
                        },
                        gridLines: { display: true, },
                        ticks: {source: 'auto'},
                    }],
                    yAxes: [
                        {	
                            stacked: true,
                            position: 'right',
                            id: 'y-axis-2',
                            display: true,
                            scaleLabel: { display : true, labelString: Y_AXIS_2 },
                            gridLines: { display: true },
                            ticks: { precision: 0 }
                        }, {
                            stacked: false,
                            position: 'left',
                            id: 'y-axis-1',
                            display: true,
                            scaleLabel: { display : true, labelString: Y_AXIS_1 },
                            gridLines: { display: false },
                            ticks: { precision: 0 }
                        }
                    ]
                }

            }
        });
    });
}


function team_performance_annuale(group_id) {
    let file=datasource_path+'team_performance_annuale.csv';
    d3.csv(file).then(function(rows) {
        if (group_id != 0  ) { 
            // filtro sul progetto 
            rows = rows.filter(function(d) { return d.group_id == group_id; })
        }
        rows.sort(function(x, y){
           return d3.ascending(x.team, y.team);
        })
        var $table = $('#table_team');
        $table.bootstrapTable({});
        $table.bootstrapTable("load",rows);
    });
}
// formatter 
function grandTotal(value,row) {
    if (row.group_id == 0)
        return '<span class="font-weight-bold">'+value+'</span>';
    else
        return value;
}
