let chartColors = {
	red: 'orangered',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 192)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)',
	grey: 'rgb(201, 203, 207)'
};

let issues_statues = { // questi sono i raggruppamenti degli stati di redmine
    '1': { label:'Backlog', color: chartColors.orange},
    '9': { label:'Being Validated', color: chartColors.green},
    '2': { label:'Being Fixed', color: chartColors.yellow}
}


// locale?
var redmine_url = 'http://'+location.hostname;
if (location.hostname == 'ktulu')
    redmine_url = 'http://monitoring-helpdesk.fimer.com';

function openbugs(project_id, peso) {
    let file=datasource_path+'open_bugs.csv'
    let url = '/datasource2/open_bugs.csv';
    fetch(url).then(response => response.json())
    .then( function (rows) {
        console.log(rows);
        if (project_id != 0  ) 
            // filtro sul progetto 
            rows = rows.filter(function(d) { return d.project_id == project_id; })
        if (peso)
            // filtro sul peso  
            // high=5, urgent = 6 and immediate = 7 //
            rows = rows.filter(function(d) { return (d.peso >=5 &&  d.peso <=7)})
        // uso il filtrato per la ciambella dei bugs di solo develpoment
        peso_bugs(rows,project_id);
        bugs_by_team(rows);
        if (project_id != 0 ) 
            close_bugs_by_root_cause(project_id,peso);
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


        // 





        var canvas = document.getElementById('doughnut_bugs_open_by_status');
        var ctx = canvas.getContext('2d');
        doughnut_bugs_open_by_status = new Chart(ctx, {
            type: 'doughnut',    
            data: { datasets : [ { data : data, backgroundColor: backgroundColor } ], labels: colonne },
            options: {
                title: { display: true, text: 'Open bugs' },
                responsive: true,
                tooltips: { mode: 'label' },
                plugins : {
                    datalabels : { render: 'value', font: { size: '20' }, },
                    doughnutlabel: { labels: [ { text: totale, font: { size: '30' } }, ] },
                }
            }
        });

        canvas.onclick = function(evt) {
            if (project_id!=0) {
                // si puo' applicare solo se project_id non e' all
                var activePoints = doughnut_bugs_open_by_status.getElementsAtEvent(evt);
                if (activePoints[0]) {
                    var chartData = activePoints[0]['_chart'].config.data;
                    var idx = activePoints[0]['_index'];
                    var label = chartData.labels[idx];
                    var status_id = Object.keys(issues_statues).find(key => issues_statues[key].label== label);
                    var priority_filter='';
                    if (is_high)
                        var priority_filter = "&f[]=priority_id&op[priority_id]==&v[priority_id][]=5&v[priority_id][]=6&v[priority_id][]=7";
                    var status_filter='';
                    if (status_id != '2' )
                        status_filter = "&f[]=status_id&op[status_id]==&v[status_id][]="+status_id;
                    else
                        status_filter = "&f[]=status_id&op[status_id]==&v[status_id][]=2&v[status_id][]=3&v[status_id][]=4&v[status_id][]=7&v[status_id][]=8";
                    // causa filtri multipli sembra necessario anche sul tracker anche se e' sempre bugs=1
                    var tracker_filter= "&f[]=tracker_id&op[tracker_id]==&v[tracker_id][]=1";
                    var url=redmine_url+"/projects/"+project_id+encodeURI("/issues?set_filter=1"+tracker_filter+status_filter+priority_filter);
                    window.open(url,'_blank');
                }
            }
        };
    });
};


function peso_bugs(rows,project_id) {
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
        .entries(rows);
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
    var canvas = document.getElementById('doughnut_bugs_priority');
    var ctx = canvas.getContext('2d');
    doughnut_bugs_priority = new Chart(ctx, {
        type: 'doughnut',    
        data:  { datasets : [ { data : data , backgroundColor: backgroundColor } ], labels: colonne },
        options: {
            title: { display: true, text:'Priority'},
            responsive: true,
            tooltips: { mode: 'label' },
            plugins : {
                datalabels : { render: 'value', font: { size: '20' }, },
                doughnutlabel: { labels: [ { text: totale, font: { size: '30' } }, ]
                },
            }
        }
    });
    canvas.onclick = function(evt) {
        if (project_id!=0) {
            // si puo' applicare solo se project_id non e' all
            var activePoints = doughnut_bugs_priority.getElementsAtEvent(evt);
            if (activePoints[0]) {
                var chartData = activePoints[0]['_chart'].config.data;
                var idx = activePoints[0]['_index'];
                var label = chartData.labels[idx];
                var priority_id = Object.keys(pesi).find(key => pesi[key].label=== label);
                var url=redmine_url+"/projects/"+project_id+encodeURI("/issues?set_filter=1&tracker_id=1&priority_id=")+priority_id;
                window.open(url,'_blank');
            }
        }
    };
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
    var canvas = document.getElementById('horizontalbar_bugs_by_team');
    var ctx = canvas.getContext('2d');
    horizontalbar_bugs_by_team = new Chart(ctx, {
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
                    ticks: { precision: 0, min :0, maxTicksLimit: 7 },
                }],
                yAxes: [{
                    stacked: true,
                }]
            }
        }
    });
}


function close_bugs_by_root_cause (project_id,peso) {
    let file=datasource_path+'close_bugs_root_cause.csv';
    d3.csv(file).then(function(rows) {
        // filtro sul progetto 
        rows = rows.filter(function(d) { return d.project_id == project_id; })
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
            if (a.key > b.key) 
                return 1;
            return -1;
        });
        let colonne = [];
        let data = [];
        rows.forEach(function (e) {
            colonne.push(e.key);
            data.push(e.value); 
        });
        var barChartData = {
            labels: colonne,
            datasets: [ { label: 'Close bugs',  data : data, backgroundColor : 'lightblue'}]
        };
        var ctx = document.getElementById('horizontalbar_close_bugs_by_root_cause').getContext('2d');
        horizontalbar_close_bugs_by_root_cause = new Chart(ctx, {
            type: 'horizontalBar',
            data: barChartData,
            options: {
                title: { display: true, text: 'Closed bugs by root cause ' },
                tooltips: { mode: 'index', intersect: false },
                responsive: true,
                scales: { xAxes: [{ ticks: { precision: 0, min :0, maxTicksLimit: 7 },}],}
            }
        });
    });


}
