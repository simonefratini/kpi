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
    rows = rows.filter(function(d) { return d.stato == "New" });
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
    var TITLE = 'Priority';
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

