function monthly_performance_chart(project_id,is_high) {

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
        {
            column: 'chiusi_previuos_month_open',
            name: 'Closed of opened in the previous months (c)',
            color: 'orange'
        }
    ];


    if (advance_debug) {
    SERIES = SERIES.concat(   
        [
        {
            column: 'ratio_all_closed',
            name: 'Ratio [(b)+(c)]/(a)',
            color: 'orangered'
        
        },]);
    }

    // Read data file and create a chart
    let file=datasource_path+'monthly_performance.csv';
    d3.csv(file).then(function(rows) {
        if (project_id != 0  ) { // filtro sul progetto 
            rows = rows.filter(function(d) { return d.project_id == project_id; })
        }
        if (is_high) { // filtro  sulla priorita' 
            rows = rows.filter(function(d) { return d.is_high == is_high; })
        }
        // aggregazione di tutti i progetti sulla data
        rows = d3.nest()
            .key(function(d) { return d.mese;})
            .rollup(function(v) { return {
                aperti: d3.sum(v, function(d) { return d.aperti;}),
                chiusi: d3.sum(v, function(d) { return d.chiusi;}),
                chiusi_assoluto: d3.sum(v, function(d) { return d.chiusi_assoluto;}),
                // arrotondo per eccesso al giorno superiore
                daytoclose: Math.ceil(d3.mean(v, function(d) { return d.daytoclose;})),
                deviazione_standard: d3.sum(v, function(d) { return d.deviazione_standard;})

            }; })
            .entries(rows)
            // devo rimappare
            .map(function (g) {
                return {
                    mese: g.key,
                    aperti: g.value.aperti,
                    chiusi: g.value.chiusi,
                    chiusi_previuos_month_open: g.value.chiusi_assoluto - g.value.chiusi,
                    daytoclose : g.value.daytoclose,
                    ratio: Math.round(100*g.value.chiusi/g.value.aperti),
                    ratio_all_closed: Math.round(100*g.value.chiusi_assoluto/g.value.aperti) ,
                    deviazione_standard : Math.round(g.value.deviazione_standard / Math.sqrt(g.value.chiusi_assoluto-1))
                }
            });

        monthly_average_performance(rows);

        var datasets = SERIES.map(function(el) {
            var type = 'bar';
            var yAxisID = 'y-axis-1';
            var order = 1;
            var stacked = 'Stack 1';
            var hidden = false;
            var pointStyle = null;

            switch (el.column) {
                case 'ratio_all_closed':    
                    hidden = true;
                case 'ratio':
                    type = 'line';
                    yAxisID = 'y-axis-2';
                    order = 0; 
                    stacked = null;
                    pointStyle = 'line';
                    break;
                case 'aperti':
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
        var ctx = document.getElementById('bar_bugs_monthly_performance').getContext('2d');
        bar_bugs_monthly_performance = new Chart(ctx, {
            type: 'bar',  // default  
            data: barChartData,
            options: {
                plugins : {
                    // escamotage per evitare sovrascrizioni della label
                    datalabels: { labels: { title: { color:null } } } 
                },
                title: { display: true, text: 'Monthly Performance' },
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
                            scaleLabel: { display : true, labelString: 'Ratio'},
                            ticks: { precision: 0 , min:0,  maxTicksLimit: 7, callback: function(value){return value+ "%"} }

                        }, {
                            stacked: true,
                            position: 'left',
                            id: 'y-axis-1',
                            scaleLabel: { display : true, labelString: 'Bugs' },
                            ticks: { precision: 0, min: 0, maxTicksLimit: 7 }
                        }
                    ]
                }

            }
        });
    });
}
function monthly_average_performance(rows) {

    var SERIES = [  // For each column representing a series, define its name and color
        {
            column: 'daytoclose',
            name: 'Average days to close',
            color: '#231964'
        }
    ];
    if (advance_debug) {
        SERIES = SERIES.concat(
        [{
            column: 'deviazione_standard',
            name: 'Standard error',
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
    var ctx = document.getElementById('bar_bugs_average_to_close').getContext('2d');
    bar_bugs_average_to_close = new Chart(ctx, {
        type: 'bar',
        data: barChartData,
        options: {
            plugins : {
                // escamotage per evitare sovrascrizioni della label
                datalabels: { labels: { title: { color:null } } }
            },
            title: { display: true, text: '' },
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
                        ticks: { precision: 0, min : 0, maxTicksLimit: 7 }
                    }
                ]
            }
        }
    });
}

function changeAllClosed(e) {
    if (e.checked) {
        bar_bugs_monthly_performance.getDatasetMeta(2).hidden=true;
    } else {
        bar_bugs_monthly_performance.getDatasetMeta(2).hidden=false;
    }
    bar_bugs_monthly_performance.update();
}

function yearly_performance(project_id,is_high) {

    let file=datasource_path+'yearly_performance.csv';
    d3.csv(file).then(function(rows) {
        if (project_id != 0  ) { // filtro sul progetto 
            rows = rows.filter(function(d) { return d.project_id == project_id; })
        }
        if (is_high) { // filtro  sulla priorita' 
            rows = rows.filter(function(d) { return d.is_high == is_high; })
        }
        // aggregazione di tutti i progetti sulla data
        rows = d3.nest()
            .key(function(d) { return d.mese;})
            .rollup(function(v) { return {
                aperti: d3.sum(v, function(d) { return d.aperti;}),
                chiusi: d3.sum(v, function(d) { return d.chiusi;}),
                // arrotondo per eccesso al giorno superiore
                daytoclose: Math.ceil(d3.mean(v, function(d) { return d.daytoclose;})),
                stddev: Math.round(d3.sum(v, function(d) { return d.deviazione_standard;})),
                aperti_assoluti: d3.sum(v, function(d) { return d.aperti_assoluti;}),
                chiusi_assoluti: d3.sum(v, function(d) { return d.chiusi_assoluti;}),
                // arrotondo per eccesso al giorno superiore
                daytoclose_assoluti: Math.ceil(d3.mean(v, function(d) { return d.daytoclose_assoluti;})),
                stddev_assoluti: Math.round(d3.sum(v, function(d) { return d.deviazione_standard_assoluti;}))
            }; })
            .entries(rows)
        // devo rimappare
            .map(function (g) {
                return {
                    conta: g.length,
                    mese: g.key,
                    aperti: g.value.aperti,
                    chiusi: g.value.chiusi,
                    daytoclose: g.value.daytoclose,
                    stddev: g.value.stddev,
                    aperti_assoluti: g.value.aperti_assoluti,
                    chiusi_assoluti: g.value.chiusi_assoluti,
                    stddev_assoluti: g.value.stddev_assoluti,
                    daytoclose_assoluti: g.value.daytoclose_assoluti
                }
            });
        let initialValue = 0;
        grand_total = {
            aperti : rows.reduce(function (a,c) { return a + c.aperti; }, initialValue),
            chiusi : rows.reduce(function (a,c) { return a + c.chiusi; }, initialValue),
            daytoclose : rows.reduce(function(a,c) { return (a+  c.daytoclose)/rows.length}, initialValue), 
            stddev : rows.reduce(function(a,c) { return (a+  c.stddev)}, initialValue), 
            aperti_assoluti : rows.reduce(function (a,c) { return a + c.aperti_assoluti; }, initialValue),
            chiusi_assoluti : rows.reduce(function (a,c) { return a + c.chiusi_assoluti; }, initialValue),
            daytoclose_assoluti : rows.reduce(function(a,c) { return (a+  c.daytoclose_assoluti);},initialValue), 
            stddev_assoluti : rows.reduce(function(a,c) { return (a+  c.stddev_assoluti) }, initialValue) 
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
                'label': 'Currently Open',
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
        if (advance_debug) {
            


            valori= valori.concat([{ 'id': 4,
                'label': ' Standard Error aka<br>Sample Standard Deviation', 
                'yearly_value':  Math.round(grand_total.stddev/Math.sqrt(grand_total.chiusi-1)),
                'yearly_percent': '',    
                'absolute_value':  Math.round(grand_total.stddev_assoluti/Math.sqrt(grand_total.chiusi_assoluti-1)),
                'absolute_percent': '',    
            },]);
        }
        var $table = $('#table');
        $table.bootstrapTable({});
        $table.bootstrapTable("load",valori);

    });
}

function summarized(value,row) {
    // la riga con il totale e' grassetto
    if (row.id == 2)
        return '<span class="font-weight-bold">'+value+'</span>';
    else if (row.id >= 3)
    // la riga con le medie di chiusura e' in corsivo e tutto il successivo di debug
        return '<span class="font-italic">'+value+'</span>';
    return value;
}
function summarizedPercent(value) {
    // le celle sono in corsivo 
   return '<span class="font-italic">'+value+'</span>';
}


