
let chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 192)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)',
	grey: 'rgb(201, 203, 207)'
};


let issues_statues = { // questi sono i raggruppamenti degli stati di redmine
    '1': { label:'Backlog', color: chartColors.green},
    '9': { label:'Being Validated', color: chartColors.orange},
    '2': { label:'Being Fixed', color: chartColors.yellow}
}

function openbugs(project_id, peso) {
    let file=datasource_path+'open_bugs.csv'
    d3.csv(file).then(function(rows) {
        if (project_id != 0  ) 
            // filtro sul progetto 
            rows = rows.filter(function(d) { return d.project_id == project_id; })
        if (peso)
            // filtro sul peso  
            // high=4, urgent = 5 and immediate = 7 //
            rows = rows.filter(function(d) { return (d.peso >=5 &&  d.peso <=7)})
        // uso il filtrato per la ciambella dei bugs di solo develpoment
        peso_bugs(rows);
        bugs_by_team(rows);
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
        var ctx = document.getElementById('ciambella').getContext('2d');
        ciambella = new Chart(ctx, {
            type: 'doughnut',    
            data: { datasets : [ { data : data, backgroundColor: backgroundColor } ], labels: colonne },
            options: {
                title: { display: true, text: 'Open bugs' },
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
                                text: totale,
                                font: { size: '30' }
                            },
                        ]
                    },
                }
            }
        });
    });
};


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
    let totale = 0;
    // ordinamento per il peso 
    rows.sort(function (a,b) {
        if (parseInt(a.key) > parseInt(b.key)) 
            return 1;
        return -1;
    });
    rows.forEach(function (e) {
        colonne.push(pesi[e.key].label);
        backgroundColor.push(pesi[e.key].color)
        data.push(e.value); 
        totale += parseInt(e.value);
    });
    var ctx = document.getElementById('pila_bugs').getContext('2d');
    pila_bugs = new Chart(ctx, {
        type: 'doughnut',    
        data:  { datasets : [ { data : data , backgroundColor: backgroundColor } ], labels: colonne },
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
                            text: totale,
                            font: { size: '30' }
                        },
                    ]
                },
            }
        }
    });
    
}

function bugs_by_team (rows) {
    rows = d3.nest()
        .key(function(d) { return d.team;})
        .key(function(d) { return d.stato;})
        .rollup(function(v) { return d3.sum(v, function(d) { return d.bugs;})}) 
        .entries(rows)
    // devo rimappare
    let colonne = [];
    let data_new = [];
    let data_fixed = [];
    let data_validated = [];
    // ordinamento per nome 
    rows.sort(function (a,b) {
        if (a.key > b.key) 
            return 1;
        return -1;
    });
    rows.forEach(function (e) {
        colonne.push(e.key);
        var f = e.values.reduce(
            (obj, item) => Object.assign(obj, { [item.key]: item.value }), {});
        if (f.hasOwnProperty('1'))
            data_new.push(f['1']);
        else
            data_new.push(''); //metto empty per non vedere il valore
        if (f.hasOwnProperty('2'))
            data_fixed.push(f['2']);
        else
            data_fixed.push('');
        if (f.hasOwnProperty('9'))
            data_validated.push(f['9']);
        else
            data_validated.push('');
    });
    var barChartData = {
        labels: colonne,
        datasets: [{
            label: issues_statues['1'].label,
            backgroundColor: issues_statues['1'].color, 
            data: data_new  
        }, {
            label: issues_statues['2'].label,
            backgroundColor: issues_statues['2'].color, 
            data: data_fixed 
        }, {
            label: issues_statues['9'].label,
            backgroundColor: issues_statues['9'].color, 
            data: data_validated 
        }]
    };
    var ctx = document.getElementById('stacked_bugs').getContext('2d');
    stacked_bugs_by_team = new Chart(ctx, {
        type: 'horizontalBar',
        data: barChartData,
        options: {
            title: { display: true, text: 'Bugs by team' },
            tooltips: { mode: 'index', intersect: false },
            responsive: true,
            scales: {
                xAxes: [{
                    stacked: true,
                    scaleLabel: { display : true, labelString: 'Bugs' },
                    ticks: { precision: 0 },
                }],
                yAxes: [{
                    stacked: true,
                }]
            }
        }
    });
}
