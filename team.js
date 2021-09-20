function team_performance_chart(group_id, is_high) {

    var SERIES = [  // For each column representing a series, define its name and color
        {
            column: 'open_previous_month',
            name: 'Owned from previous month (a)',
            color: colore('orange',.8),
        },
        {
            column: 'open_this_month',
            name: 'Owned from month (b)',
            color: colore('orangered',.9),
        },
        {
            column: 'close_previous_month_open',
            name: 'Moved or closed from previous month (c)',
            color: 'lightgreen'
        },
        {
            column: 'close_this_month',
            name: 'Moved or closed from month (d)',
            color: 'green'
        },
        {
            column: 'ratio',
            name: 'Ratio (d)/(b) ',
            color: 'blue'
        },
        {
            column: 'ratio_all_closed',
            name: 'Ratio [c+d]/[a+b]',
            color: 'fuchsia'
        }
    ];

    // Read data file and create a chart
    let url=datasource_path+'team_performance.json';
    fetch(url).then(response => response.json())
        .then( function (rows) {
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
                open_previous_month: d3.sum(v, function(d) { return d.open_previous_month;}),
                close_previous_month_open: d3.sum(v, function(d) { return d.close_previous_month}),
                close_this_month: d3.sum(v, function(d) { return (d.close_this_month) ;}),
                open_this_month: d3.sum(v, function(d) { return (d.open_this_month) ;}),
                // arrotondo per eccesso al giorno superiore
                days: Math.ceil(d3.mean(v, function(d) { return d.days;})),
                deviazione_standard: d3.sum(v, function(d) { return d.deviazione_standard;})
            }; })
            .entries(rows)
            // devo rimappare
            .map(function (g) {
                return {
                    mese: g.key,
                    open_previous_month: g.value.open_previous_month,
                    close_previous_month_open:  g.value.close_previous_month_open,
                    close_this_month: g.value.close_this_month, 
                    open_this_month: g.value.open_this_month, 
                    days: g.value.days,
                    ratio : Math.round(100 * (g.value.close_this_month / g.value.open_this_month)), 
                    ratio_all_closed : Math.round(100 * ( g.value.close_previous_month_open + g.value.close_this_month )/ (g.value.open_this_month+ g.value.open_previous_month)), 
                    deviazione_standard : Math.round(g.value.deviazione_standard / Math.sqrt(g.value.open_previous_month - 1))
                }
            });
        // eseguo la funzione sotto 
        team_latency(rows);

        // 
        var datasets = SERIES.map(function(el) {
            var type = 'bar';
            var yAxisID = 'y-axis-1';
            var order = 1;
            var stacked = 'Stack 1';
            var hidden = false;
            var pointStyle = null;

            switch (el.column) {
                case 'ratio_all_closed':
                case 'ratio':
                    type = 'line';
                    yAxisID = 'y-axis-2';
                    order = 0;
                    stacked = null;
                    pointStyle = 'line';
                    break;
                case 'open_this_month':
                case 'open_previous_month':
                    stacked = 'Stack 0';
                    break;
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
                stack: stacked,
                hidden: hidden,
                pointStyle: pointStyle,
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
        var ctx = document.getElementById('bar_team_performance').getContext('2d');
        bar_team_performance = new Chart(ctx, {
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
                            gridLines: { display: false },
                            scaleLabel: { display : true, labelString: 'Ratio' },
                            ticks: { precision: 0, min: 0,  maxTicksLimit: 7, callback: function(value){return value+ "%"} }
                        }, {
                            position: 'left',
                            id: 'y-axis-1',
                            scaleLabel: { display : true, labelString: 'Bugs' },
                            ticks: { precision: 0, min : 0, maxTicksLimit: 7 }
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
            name: 'Average days a bug was owned',
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
    var ctx = document.getElementById('bar_team_latency').getContext('2d');
    bar_team_latency = new Chart(ctx, {
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
                        ticks: { precision: 0, min :0, maxTicksLimit: 7 }
                    }, 
                ]
            }

        }
    });
}

function team_performance_annuale(group_id,is_high) {
    let url=datasource_path+'team_performance_annuale.json';
    fetch(url).then(response => response.json())
        .then( function (rows) {
            // filtro sul progetto 
            if (group_id != 0  )  
                rows = rows.filter(function(d) { return d.group_id == group_id; })
            // filtro  sulla priorita'
            if (is_high)  
                rows = rows.filter(function(d) { return d.is_high == is_high; })

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
                        delta : g.values[0].value.bugs - g.values[0].value.move_or_close, 
                        days: g.values[0].value.days, 
                        // questo si ricalcola 
                        ratio : Math.round(100 * (g.values[0].value.move_or_close / g.values[0].value.bugs)) 
                    }
                });

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
    var grassetto=''
    if (row.group_id == 0)
        grassetto="font-weight-bold"
    return '<span class="small '+grassetto+'">'+value+'</span>';
}


function authorOpenBugs(group_id,peso) {
    if (group_id != 0  ) {
        let url = datasource_path+'team_author_open_bugs.json';
        fetch(url).then(response => response.json())
            .then( function (rows) {
                // filtro sul team 
                rows = rows.filter(function(d) { return d.group_id == group_id; })
                if (peso)
                    // filtro sul peso  
                    // high=5, urgent = 6 and immediate = 7 //
                    rows = rows.filter(function(d) { return (d.peso >=5 &&  d.peso <=7)})
                // uso il filtrato per la ciambella dei bugs di solo develpoment
                //peso_bugs(rows,project_id);

                // aggregazione di tutti i progetti sulla data
                rows = d3.nest()
                    .key(function(d) { return d.stato;})
                    .rollup(function(v) { return d3.sum(v, function(d) { return d.bugs;})}) 
                    .entries(rows)
                let colonne = [];
                let data = [];
                let backgroundColor  = [];
                let totale= 0;
                //
                rows.forEach(function (e) {
                    colonne.push(issues_statues[e.key].label);
                    data.push(e.value); 
                    backgroundColor.push(issues_statues[e.key].color);
                    totale += parseInt(e.value);
                });

                var canvas = document.getElementById('doughnut_author_bugs_open');
                var ctx = canvas.getContext('2d');
                doughnut_author_bugs_open = new Chart(ctx, {
                    type: 'doughnut',    
                    data: { datasets : [ { data : data, backgroundColor: backgroundColor } ], labels: colonne },
                    options: {
                        title: { display: true, text: 'Still open bugs reported by team' },
                        responsive: true,
                        tooltips: { mode: 'label' },
                        plugins : {
                            datalabels : { render: 'value', font: { size: '20' }, },
                            doughnutlabel: { labels: [ { text: totale, font: { size: '30' } }, ] },
                        }
                    }
                });
            });
    }
}

function close_bugs_root_cause_vs_author_team(group_id,peso) {
    let url = datasource_path+'close_bugs_root_cause_vs_author_team.json';
    fetch(url).then(response => response.json()).then(function (rows) {
        // filtro sul progetto 
        rows = rows.filter(function(d) { return d.group_id == group_id; })
        if (peso)
            // filtro sul peso  high=5, urgent = 6 and immediate = 7 //
            rows = rows.filter(function(d) { return (d.peso >=5 &&  d.peso <=7)})
        // aggregazione di tutti i progetti sulla causa 
        rows = d3.nest()
            .key(function(d) { return d.cause;})
            .rollup(function(v) { return d3.sum(v, function(d) { return d.bugs;})}) 
            .entries(rows);
        // ordinamento per nome
        rows.sort(function (a,b) {
            if (a.value < b.value) 
                return 1;
            return -1;
        });

        let colonne = [];
        let data = [];
        let backgroundColor = [];
        let totale = 0; 
        let cardinalita = 0
        rows.forEach(function (e) {
            totale += e.value;
            cardinalita++;
        });

        rows.forEach(function (e,index) {
            colonne.push(e.key);
            data.push(e.value); 
            backgroundColor.push("hsl(" + Math.round(360 * index / cardinalita) + ",80%,60%)");
        });

        var colors = [];
        while (colors.length < 100) {
            do {
                var color = Math.floor((Math.random()*1000000)+1);
            } while (colors.indexOf(color) >= 0);
            colors.push("#" + ("000000" + color.toString(16)).slice(-6));
        }


        var barChartData = {
            labels: colonne,
            datasets: [ { label: 'Close bugs',  data : percentRound(data,0), backgroundColor : backgroundColor}]
        };
        var canvas = document.getElementById('torta_close_bugs_root_cause_by_author_team');
        var ctx = canvas.getContext('2d');
        let tooltip = document.getElementById("legendRootCause");
        let hovering = false;

        torta_close_bugs_root_cause_by_author_team = new Chart(ctx, {
            type: 'pie',
            data: barChartData,
            options: {
                legend: {
                    position: 'right',
                    onHover: function(event, legendItem) {
                        if (hovering) {
                         return;
                        }
                        hovering = true;
                        tooltip.innerHTML = root_cause_tooltip[legendItem.text];
                        tooltip.style.left = (event.layerX+30) + "px"; 
                        tooltip.style.top = (event.layerY-30) +"px";
                    },
                    onLeave: function() {
                        hovering = false;
                        tooltip.innerHTML = "";
                    }
                },


                title: { display: true, text: 'Closed bugs by root cause reported by team' },
                tooltips: { enabled: true },
                responsive: true,
                plugins: { datalabels: {
                       borderRadius: 10,
                       align: 'center',
                       anchor: 'end',
                       formatter: (value, ctx) => { return value+"%";},
                       backgroundColor: 'white', 
                       color: 'black'}
                },
            }

        });
    });
}
