function team_performance_chart(group_id, is_high) {

    var SERIES = [  // For each column representing a series, define its name and color
        {
            column: 'bugs',
            name: 'Bug owned in the month (a) ',
            color: 'lightblue'
        },
        {
            column: 'unleash',
            name: 'Bug moved or closed in the month (b) ',
            color: '#FFF014'
        },
        {
            column: 'ratio',
            name: 'Ratio (b)/(a) ',
            color: '#231964'
        }
    ];
    // Read data file and create a chart
    let file=datasource_path+'team_performance.csv';
    d3.csv(file).then(function(rows) {
        // filtro sul progetto 
        if (group_id != 0  )  
            rows = rows.filter(function(d) { return d.group_id == group_id; })
        // filtro  sulla priorita'
        if (is_high)  
            rows = rows.filter(function(d) { return d.is_high == is_high; })
        // aggregazione di tutti i progetti sulla data
        rows = d3.nest()
            .key(function(d) { return d.mese;})
            .rollup(function(v) { return {
                bugs: d3.sum(v, function(d) { return d.bugs;}),
                stillown: d3.sum(v, function(d) { return (d.stillown) ;}),
                // arrotondo per eccesso al giorno superiore
                days: Math.ceil(d3.mean(v, function(d) { return d.days;})),
                deviazione_standard: d3.sum(v, function(d) { return d.deviazione_standard;})
            }; })
            .entries(rows)
            // devo rimappare
            .map(function (g) {
                return {
                    mese: g.key,
                    bugs: g.value.bugs,
                    stillown: g.value.stillown, 
                    unleash: g.value.bugs - g.value.stillown,
                    days: g.value.days,
                    ratio : Math.round(100 * (1  - g.value.stillown / g.value.bugs)), 
                    deviazione_standard : Math.round(g.value.deviazione_standard / Math.sqrt(g.value.bugs - 1))
                }
            });
        // eseguo la funzione sotto 
        team_latency(rows);
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
                return moment(el['mese']).format('MMM y');
            }),
            datasets: datasets,
        };
        var ctx = document.getElementById('barre_team').getContext('2d');
        barre_team = new Chart(ctx, {
            type: 'bar',  // default  
            data: barChartData,
            options: {
                plugins : {
                    // escamotage per evitare sovrascrizioni della label
                    datalabels: { labels: { title: { color:null } } }
                },
                title: { display: true, text: 'Team Performance' },
                responsive: true,
                tooltips: { mode: 'label' },
                scales: {
                    xAxes: [{
                        scaleLabel: { display: false, },
                        gridLines: { display: true, },
                        ticks: {source: 'auto'},
                    }],
                    yAxes: [
                        {	
                            position: 'right',
                            id: 'y-axis-2',
                            scaleLabel: { display : true, labelString: 'Ratio' },
                            gridLines: { display: true },
                            ticks: { precision: 0, min: 0,  maxTicksLimit: 5, callback: function(value){return value+ "%"} }
                        }, {
                            position: 'left',
                            id: 'y-axis-1',
                            scaleLabel: { display : true, labelString: 'Bugs' },
                            gridLines: { display: false },
                            ticks: { precision: 0, min : 0, maxTicksLimit: 5 }
                        }
                    ]
                }

            }
        });
    });
}

function team_latency(rows) {

    var SERIES = [  // For each column representing a series, define its name and color
        {
            column: 'days',
            name: 'Average days a bug is in charge',
            color: '#231964'
        },
    ];
    if (advance_debug) {
        SERIES = SERIES.concat(
        [{
            column: 'deviazione_standard',
            name: 'Standard Error*',
            color: 'orangered'
        }] );
    };

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
            return moment(el['mese']).format('MMM y');
        }),
        datasets: datasets,

    };
    var ctx = document.getElementById('barre_latency').getContext('2d');
    barre_latency = new Chart(ctx, {
        type: 'bar',  // default  
        data: barChartData,
        options: {
            plugins : {
                // escamotage per evitare sovrascrizioni della label
                datalabels: { labels: { title: { color:null } } }
            },
            title: { display: true, text: 'Latency'},
            responsive: true,
            tooltips: { mode: 'label' },
            scales: {
                xAxes: [{
                    scaleLabel: { display: false, },
                }],
                yAxes: [
                    {	
                        position: 'right',
                        scaleLabel: { display : true, labelString: 'Days' },
                        ticks: { precision: 0, min :0, maxTicksLimit: 5 }
                    }, 
                ]
            }

        }
    });
}

function team_performance_annuale(group_id,is_high) {
    let file=datasource_path+'team_performance_annuale.csv';
    d3.csv(file).then(function(rows) {
        // filtro sul progetto 
        if (group_id != 0  )  
            rows = rows.filter(function(d) { return d.group_id == group_id; })
        // filtro  sulla priorita'
        if (is_high)  
            rows = rows.filter(function(d) { return d.is_high == is_high; })
        else {
            // devo aggregare sul is_high
            // doppia aggregazione per gruppo e team non riesco a farlo in una botta sola
            rows = d3.nest()
            .key(function(d) { return d.group_id ;})
            .key(function(d) { return d.team ;})
            .rollup(function(v) { return {
                bugs: d3.sum(v, function(d) { return d.bugs;}),
                move_or_close: d3.sum(v, function(d) { return (d.move_or_close) ;}),
                // qui si ricalcola nel caso non c'è filtro
                days: Math.ceil(d3.mean(v, function(d) { return d.days;}))
            }; })
            .entries(rows)
            // devo rimappare
            .map(function (g) {
                return {
                    group_id: g.key,
                    team: g.values[0].key,
                    bugs: g.values[0].value.bugs,
                    move_or_close: g.values[0].value.move_or_close, 
                    days: g.values[0].value.days, 
                    // questo si ricalcola 
                    ratio : Math.round(100 * (g.values[0].value.move_or_close / g.values[0].value.bugs)) 
                }
            });
        }
        // ordinamento
        rows.sort(function(x, y){ return d3.ascending(x.team, y.team); })
        // aggiungo il percento a questo oggetto perverso del d3 csv -- usare json invece che csv TODO
        Object.entries(rows).forEach(row => { row[1].ratio += '%';});
        var $table = $('#table_team');
        $table.bootstrapTable({});
        $table.bootstrapTable("load",rows);
    });
}
// formatter 
function grandTotal(value,row) {
    if (row.group_id == 0)
        return '<span class="font-weight-bold">'+value+'</span>';
    return value;
}
