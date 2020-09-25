
function monthly_performance_chart(project_id) {

    var TITLE = 'Monthly Performance';
    var LABELS = 'mese';  // Column to define 'bucket' names (x axis)
    var SERIES = [  // For each column representing a series, define its name and color
        {
            column: 'aperti',
            name: 'Opened in the month (a)',
            color: 'lightblue'
        },
        {
            column: 'chiusi',
            name: 'Closed of opened in the same month (b) ',
            color: '#FFF014'
        },
        {
            column: 'ratio',
            name: 'Ratio (b)/(a)',
            color: '#231964'
        },
    ];
    var Y_AXIS_1 = 'Bugs'; // y-axis label and label in tooltip
    var Y_AXIS_2 = 'Ratio'; // y-axis label and label in tooltip
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
                    daytoclose : g.value.daytoclose,
                    ratio: Math.round(100*g.value.chiusi/g.value.aperti),
                }
            });

        monthly_average_performance(rows);

        var datasets = SERIES.map(function(el) {
            var type = 'bar';
            var yAxisID = 'y-axis-1';
            var order = 1;
            if (el.column == 'ratio') {
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
                lineTension: 0.2,
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
                            ticks: { min: 0, max:100,  maxTicksLimit: 7, callback: function(value){return value+ "%"} }

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

function monthly_average_performance(rows) {

    var LABELS = 'mese';  // Column to define 'bucket' names (x axis)
    var SERIES = [  // For each column representing a series, define its name and color
        {
            column: 'daytoclose',
            name: 'Average days to close',
            color: '#231964'
        }
    ];
    var datasets = SERIES.map(function(el) {
        return {
            label: el.name,
            labelDirty: el.column,
            backgroundColor: el.color,
            borderColor: el.color,
            fill : false,
            lineTension: 0.2,
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
    var ctx = document.getElementById('barre_average').getContext('2d');
    barre_average = new Chart(ctx, {
        type: 'line',
        data: barChartData,
        options: {
            plugins : {
                datalabels: {
                    labels: { // escamotage per evitare sovrascrizioni della label
                        title: { color:null }
                    }
                }
            },
            title: { display: true, text: '' },
            responsive: true,
            tooltips: { mode: 'label' },
            scales: {
                xAxes: [{
                    scaleLabel: { display: false, },
                    ticks: {source: 'auto'},
                }],
                yAxes: [
                    {	
                        position: 'right',
                        scaleLabel: { display : true, labelString: 'Days' },
                    }
                ]
            }
        }
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

        function percentuale(valore,totale) {
            if (totale > 0)
                return Math.round(100*valore/totale)+'%';
            return '-';
        }
        var valori = [
            { 'id': 0,
                'label': 'Open',
                'yearly_value':  grand_total.aperti,
                'yearly_percent':  percentuale(grand_total.aperti,grand_total.totale),
                'absolute_value':  grand_total.aperti_assoluti,
                'absolute_percent':  percentuale(grand_total.aperti_assoluti,grand_total.totale_assoluti),
            },
            { 'id': 1,
                'label': 'Closed',
                'yearly_value': grand_total.chiusi,
                'yearly_percent': percentuale(grand_total.chiusi,grand_total.totale),
                'absolute_value': grand_total.chiusi_assoluti,
                'absolute_percent': percentuale(grand_total.chiusi_assoluti,grand_total.totale_assoluti),
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


