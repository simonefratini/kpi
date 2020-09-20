let colorGroup = { 
 "Connectivity": "rgb(75,192,192)",
 "DVT Functional": "rgb(255,159,64)",
 "DVT Integration": "rgb(153,102,255)",
 "DVT Reliability": "rgb(255,99,132)",
 "Digital Hardware": "pink",
 "Embedded Control - Firmware": "rgb(54,162,235)",
 "Mechanical Designer": "lightblue",
 "Power Hardware": "rgb(255,205,86)",
 "Product Engineering": "lightgreen",
 "Project Management": "orangered",
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
        let backgroundColor  = [];
        let TOTALE_APERTI= 0;
        let statiColor = { 
                 'New' : 'lightgreen',
                 'Being Fixed': '#FFF014', 
                 'Being Validated': 'lightblue', 
                 };

        rows.forEach(function (e) {
            colonne.push(e.key);
            data.push(e.value); 
            backgroundColor.push(statiColor[e.key]);
            TOTALE_APERTI += parseInt(e.value);
        });
        let dati_ciambella  = { datasets : [ { data : data, backgroundColor: backgroundColor } ], labels: colonne };

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
    var TITLE = 'Being fixed by team';
    // filtro per stato 
    // attenzione la label  è statica!!! TODO
    rows = rows.filter(function(d) { return d.stato == "Being Fixed" });
    // aggregazione di tutti i progetti sulla data
    rows = d3.nest()
        .key(function(d) { return d.team;})
        .rollup(function(v) { return d3.sum(v, function(d) { return d.bugs;})}) 
        .entries(rows)
    // devo rimappare
    let colonne = [];
    let data = [];
    let backgroundColor = []
    let TOTALE_APERTI= 0;
    // ordinamento per nome 
    rows.sort(function (a,b) {
        if (a.key > b.key) 
            return 1;
        return -1;
    });
    rows.forEach(function (e) {
        colonne.push(e.key);
        data.push(e.value); 
        backgroundColor.push(colorGroup[e.key]);
        TOTALE_APERTI += parseInt(e.value);
    });
    let dati_ciambella = { datasets : [ { data : data , backgroundColor: backgroundColor } ], labels: colonne };
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
    rows = rows.filter(function(d) { return d.stato == "New" });
    // aggregazione di tutti i progetti sulla data
    rows = d3.nest()
        .key(function(d) { return d.team;})
        .rollup(function(v) { return d3.sum(v, function(d) { return d.bugs;})}) 
        .entries(rows)
    // devo rimappare
    let colonne = [];
    let data = [];
    let backgroundColor = [];
    let TOTALE_APERTI= 0;
    // ordinamento per nome 
    rows.sort(function (a,b) {
        if (a.key > b.key) 
            return 1;
        return -1;
    });
    rows.forEach(function (e) {
        colonne.push(e.key);
        data.push(e.value); 
        backgroundColor.push(colorGroup[e.key]);
        TOTALE_APERTI += parseInt(e.value);
    });
    let dati_ciambella = { datasets : [ { data : data , backgroundColor: backgroundColor } ], labels: colonne };
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
    var TITLE = 'Priority';
    // attenzione la label  è statica!!! TODO
    let pesi={ 3 : { color:'lightcyan', label:'Low'},
             4 : { color:'lightgreen', label:'Normal'},
             5 : { color:'yellow', label:'High'},
             6 : { color:'orange', label:'Urgent'},
             7 : { color:'orangered', label:'Immediate'},
            39 : { color:'lightgrey', label:'Not set' }
             };
           
    rows = d3.nest()
        .key(function(d) { return d.peso})
        .rollup(function(v) { return d3.sum(v, function(d) { return d.bugs;})}) 
        .entries(rows)
        // devo rimappare
    let colonne = [];
    let data = [];
    let backgroundColor = [];
    let TOTALE_APERTI = 0;
    rows.forEach(function (e) {
        colonne.push(pesi[e.key].label);
        backgroundColor.push(pesi[e.key].color)
        data.push(e.value); 
        TOTALE_APERTI += parseInt(e.value);
    });
    let dati_ciambella = { datasets : [ { data : data , backgroundColor: backgroundColor } ], labels: colonne };
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

    var TITLE = 'Monthly Performance';
    var LABELS = 'mese';  // Column to define 'bucket' names (x axis)
    var SERIES = [  // For each column representing a series, define its name and color
        {
            column: 'aperti',
            name: 'Open in the month',
            color: 'lightblue'
        },
        {
            column: 'chiusi',
            name: 'Closed of opened in the same month',
            color: '#FFF014'
        },
        {
            column: 'daytoclose',
            name: 'Average days to close',
            color: '#231964'
        }
    ];
    var Y_AXIS_1 = 'Bugs'; // y-axis label and label in tooltip
    var Y_AXIS_2 = 'Days'; // y-axis label and label in tooltip
    // Read data file and create a chart
    let file=datasource_path+'monthly_performance.csv';
    d3.csv(file).then(function(rows) {
        if (project_id != 0  ) { // filtro sul progetto 
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
    });
}

function yearly_performance(project_id) {

    let file=datasource_path+'yearly_performance.csv';
    d3.csv(file).then(function(rows) {
        if (project_id != 0  ) { // filtro sul progetto 
            rows = rows.filter(function(d) { return d.project_id == project_id; })
        }
        // aggregazione di tutti i progetti sulla data
        rows = d3.nest()
            .key(function(d) { return d.mese;})
            .rollup(function(v) { return {
                aperti: d3.sum(v, function(d) { return d.aperti;}),
                chiusi: d3.sum(v, function(d) { return d.chiusi;}),
                // arrotondo per eccesso al giorno superiore
                daytoclose: Math.ceil(d3.mean(v, function(d) { return d.daytoclose;})),
                aperti_assoluti: d3.sum(v, function(d) { return d.aperti_assoluti;}),
                chiusi_assoluti: d3.sum(v, function(d) { return d.chiusi_assoluti;}),
                // arrotondo per eccesso al giorno superiore
                daytoclose_assoluti: Math.ceil(d3.mean(v, function(d) { return d.daytoclose_assoluti;}))
            }; })
            .entries(rows)
        // devo rimappare
            .map(function (g) {
                return {
                    mese: g.key,
                    aperti: g.value.aperti,
                    chiusi: g.value.chiusi,
                    daytoclose: g.value.daytoclose,
                    aperti_assoluti: g.value.aperti_assoluti,
                    chiusi_assoluti: g.value.chiusi_assoluti,
                    daytoclose_assoluti: g.value.daytoclose_assoluti
                }
            });
        let initialValue = 0;
        grand_total = {
            aperti : rows.reduce(function (a,c) { return a + c.aperti; }, initialValue),
            chiusi : rows.reduce(function (a,c) { return a + c.chiusi; }, initialValue),
            daytoclose : rows.reduce(function(a,c) { return (a+  c.daytoclose)/rows.length}, initialValue), 
            aperti_assoluti : rows.reduce(function (a,c) { return a + c.aperti_assoluti; }, initialValue),
            chiusi_assoluti : rows.reduce(function (a,c) { return a + c.chiusi_assoluti; }, initialValue),
            daytoclose_assoluti : rows.reduce(function(a,c) { return (a+  c.daytoclose_assoluti)/rows.length;},initialValue) 
        }
        // valori finali
        grand_total["totale"]=grand_total.aperti+grand_total.chiusi;
        grand_total["totale_assoluti"]=grand_total.aperti_assoluti+grand_total.chiusi_assoluti;
        var valori = [
            { 'id': 0,
                'label': 'Open',
                'yearly_value':  grand_total.aperti,
                'yearly_percent':  Math.round(100*grand_total.aperti/grand_total.totale)+'%',
                'absolute_value':  grand_total.aperti_assoluti,
                'absolute_percent':  Math.round(100*grand_total.aperti_assoluti/grand_total.totale_assoluti)+'%',
            }];

        // valori finali
        grand_total["totale"]=grand_total.aperti+grand_total.chiusi;
        var valori = [
            { 'id': 0,
                'label': 'Open',
                'yearly_value':  grand_total.aperti,
                'yearly_percent':  Math.round(100*grand_total.aperti/grand_total.totale)+'%',
                'absolute_value':  grand_total.aperti_assoluti,
                'absolute_percent':  Math.round(100*grand_total.aperti_assoluti/grand_total.totale_assoluti)+'%',
            },
            { 'id': 1,
                'label': 'Closed',
                'yearly_value': grand_total.chiusi,
                'yearly_percent': Math.round(100*grand_total.chiusi/grand_total.totale)+'%',
                'absolute_value': grand_total.chiusi_assoluti,
                'absolute_percent': Math.round(100*grand_total.chiusi_assoluti/grand_total.totale_assoluti)+'%',
            },
            { 'id': 2,
                'label': 'Total',
                'yearly_value':  grand_total.totale,
                'yearly_percent': '',    
                'absolute_value':  grand_total.totale_assoluti,
                'absolute_percent': '',    
            },
            { 'id': 3,
                'label': 'Average days to close', 
                'yearly_value':  grand_total.daytoclose,
                'yearly_percent': '',    
                'absolute_value':  grand_total.daytoclose_assoluti,
                'absolute_percent': '',    
            },
        ];
        var $table = $('#table');
        $table.bootstrapTable({});
        $table.bootstrapTable("load",valori);

    });
}

function summarized(value,row) {
    if (row.id == 2)
        return '<span class="font-weight-bold">'+value+'</span>';
    else if (row.id == 3)
        return '<span class="font-italic">'+value+'</span>';
    return value;
}
function summarizedPercent(value) {
   return '<span class="font-italic">'+value+'</span>';
}
