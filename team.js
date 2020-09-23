function team_performance_chart(group_id) {

    var LABELS = 'mese';  // Column to define 'bucket' names (x axis)
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
                    days: g.value.days,
                    ratio : Math.round(100 * (1  - g.value.stillown / g.value.bugs)) 
                }
            });

        //team_latency(rows);
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
                title: { display: true, text: 'Team Performance' },

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
                            scaleLabel: { display : true, labelString: 'Ratio' },
                            gridLines: { display: true },
                            ticks: { min: 0, max:100,  maxTicksLimit: 7, callback: function(value){return value+ "%"} }
                        }, {
                            stacked: false,
                            position: 'left',
                            id: 'y-axis-1',
                            display: true,
                            scaleLabel: { display : true, labelString: 'Bugs' },
                            gridLines: { display: false },
                            ticks: { precision: 0 }
                        }
                    ]
                }

            }
        });
    });
}

function team_latency(rows) {

    var TITLE = 'Team Latency Performance';
    var LABELS = 'mese';  // Column to define 'bucket' names (x axis)
    var SERIES = [  // For each column representing a series, define its name and color
        {
            column: 'days',
            name: 'Average days, bug own in the month',
            color: '#231964'
        },
    ];


    var Y_AXIS_2 = 'Days'; // y-axis label and label in tooltip
    // Read data file and create a chart
    var datasets = SERIES.map(function(el) {
        return {
            label: el.name,
            labelDirty: el.column,
            backgroundColor: el.color,
    		borderColor: el.color,
            fill : false,
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
    var ctx = document.getElementById('barre_latency').getContext('2d');
    barre_latency = new Chart(ctx, {
        type: 'line',  // default  
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
                    }, 
                ]
            }

        }
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
