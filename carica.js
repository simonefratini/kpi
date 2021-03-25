
/// definizione globale delle variabili
var datasource_path='./datasource/';
Chart.defaults.global.legend.position = 'bottom' ;  
Chart.defaults.global.legend.labels.usePointStyle = true ;  
var selectProjectID='selectProject';
var selectGroupID='selectGroup';
var is_high = false;
var advance_debug = false;
// necessarie per distruggere i grafico vecchio
var bar_bugs_monthly_performance = null;
var bar_bugs_average_to_close = null;
var bar_team_performance = null;
var bar_team_latency = null;
var doughnut_bugs_open_by_status = null;
var doughnut_bugs_priority = null;
var horizontalbar_bugs_by_team = null;
var torta_close_bugs_root_cause = null;
var torta_close_bugs_root_cause_DVT = null;


// funzione per generare un numero random per forzare il reload delle chiamate con fetch
function random_version() { return Math.round(Math.random()*1E+8);
}

// funzione per recuperare i progetti/team ecc chiave valore semplice
function setSelect(source_json_file,select_id) {
    fetch(source_json_file+'?v='+random_version())
        .then(response => response.json())
        .then( function (list) { 
            let selettore = document.getElementById(select_id);
            list.sort(); // ordinamento
            list.forEach ( function (v) {
                option = document.createElement("option");
                option.text = v.description;
                if (select_id == selectProjectID)
                    option.value = v.project_id;
                else
                    option.value = v.group_id;

                selettore.add(option);
            });
        });
}
function popola_tutto() {
// popola dati con valori di tutti     
// is_high = o equivale a tutti i bugs aperto
// project_id=0 equivale ad ALL
// team_id = 0 equivale ad All Teams - One Company
let s = document.getElementById(selectProjectID);
let project_id = s.options[s.selectedIndex].value;
s = document.getElementById('selectGroup');
let team_id = s.options[s.selectedIndex].value;
popola_project(project_id,is_high);
popola_bugs(project_id,is_high);
popola_team(team_id,is_high);

}

// selezione dinamica sul select id (mettere this nella chiamata )
function changeSelect(e) {
    let selected_value = e.options[e.selectedIndex].value;
    if (e.id == selectProjectID) {
        popola_project(selected_value,is_high);
        popola_bugs(selected_value,is_high);
    }
    else
        popola_team(selected_value, is_high);
};

// selezione dinamica sul checkbox della priorita'
function changePriority(e) { 
    // setto variabile globale
    is_high = e.checked
    popola_tutto();
};

// selezione dinamica sul checkbox debug come variabile globale
function changeDebug(e) { 
    if (e.checked)
        window.alert('This is only for debug! Please, take care.');
    advance_debug = e.checked;
    popola_tutto();
};

function start() {
// popola le select all'avvio
setSelect(datasource_path+'project.json','selectProject');
setSelect(datasource_path+'group.json','selectGroup');
popola_tutto();
}


function setFocus() {
  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
  var target = $(e.target).attr("href") // activated tab
  if (target == '#project')  
    document.getElementById(selectProjectID).focus();
  else
    document.getElementById('selectGroup').focus();
});
}

function popola_bugs(pid, is_high) {
    if (doughnut_bugs_open_by_status != undefined)
        doughnut_bugs_open_by_status.destroy();
    if (doughnut_bugs_priority != undefined)
        doughnut_bugs_priority.destroy();
    if (horizontalbar_bugs_by_team != undefined)
        horizontalbar_bugs_by_team.destroy();
    if (torta_close_bugs_root_cause != undefined) 
        torta_close_bugs_root_cause.destroy();
    if (torta_close_bugs_root_cause_DVT != undefined)
        torta_close_bugs_root_cause_DVT.destroy();
    openbugs(pid,is_high);
    getTimestamp();
}

function popola_project(pid, is_high) {
    if (bar_bugs_monthly_performance != undefined)
        bar_bugs_monthly_performance.destroy();
    if (bar_bugs_average_to_close != undefined)
        bar_bugs_average_to_close.destroy();
    monthly_performance_chart(pid, is_high);
    yearly_performance(pid, is_high);
}

function popola_team(gid, is_high) {
    if (bar_team_performance != undefined)
        bar_team_performance.destroy();
    if (bar_team_latency != undefined)
        bar_team_latency.destroy();
    team_performance_chart(gid, is_high);
    team_performance_annuale(gid, is_high);
}

function getTimestamp() {
    // funzione per recuperare il timestamp in cui e' avvenuta estrazione dei dati
    let url=datasource_path+'timestamp.json';
    fetch(url+'?v='+random_version())
        .then(response => response.json())
        .then( function (list) { 
                document.getElementById('timestamp').innerHTML = ' @ '+list[0].timestamp;
        });
}



function colourNameToHex(colour)
{
    var colours = {"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
    "beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
    "cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
    "darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
    "darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1",
    "darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff",
    "firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
    "gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f",
    "honeydew":"#f0fff0","hotpink":"#ff69b4",
    "indianred ":"#cd5c5c","indigo":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
    "lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
    "lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de",
    "lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
    "magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
    "mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
    "navajowhite":"#ffdead","navy":"#000080",
    "oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
    "palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
    "rebeccapurple":"#663399","red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
    "saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
    "tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
    "violet":"#ee82ee",
    "wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5",
    "yellow":"#ffff00","yellowgreen":"#9acd32"};

    if (typeof colours[colour.toLowerCase()] != 'undefined')
        return colours[colour.toLowerCase()];

    return false;
}

function hexToRgbA(hex,fade){
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+fade+')';
    }
    throw new Error('Bad Hex');
}


function colore(nome,fade) {

    return hexToRgbA(colourNameToHex(nome),fade);

}

// funcione per trasformare un array di numeri in percentuali, tenendo conto degli arrotondamenti 
// https://github.com/super-ienien/percent-round#readme
function percentRound(ipt, precision = 0) {
    if (!Array.isArray(ipt)) {
        throw new Error('percentRound input should be an Array');
    }
    const iptPercents = ipt.slice();
    const length = ipt.length;
    const out = new Array(length);
    let total = 0;
    for (let i = length - 1; i >= 0; i--) {
        if (typeof iptPercents[i] === "string") {
            iptPercents[i] = Number.parseFloat(iptPercents[i]);
        }
        total += iptPercents[i] * 1;
    }
    if (isNaN(total)) {
        throw new Error('percentRound invalid input');
    }
    if (total === 0) {
        out.fill(0);
    } else {
        const powPrecision = Math.pow(10, precision);
        let check100 = 0;
        for (let i = length - 1; i >= 0; i--) {
            iptPercents[i] = 100 * iptPercents[i] / total;
            check100 += out[i] = (Math.round(iptPercents[i] * powPrecision) / powPrecision);
        }
        if (check100 !== 100) {
            const totalDiff = check100 - 100;
            const roundGrain = 1 / powPrecision;
            let grainCount = Math.round(Math.abs(totalDiff / roundGrain));
            const diffs = new Array(length);
            for (let i = 0; i < length; i++) {
                diffs[i] = Math.abs(out[i] - iptPercents[i]);
            }
            while (grainCount > 0) {
                let idx = 0;
                let maxDiff = diffs[0];
                for (let i = 1; i < length; i++) {
                    if (maxDiff < diffs[i]) {
                        idx = i;
                        maxDiff = diffs[i];
                    }
                }
                if (check100 > 100) {
                    out[idx] -= roundGrain;
                } else {
                    out[idx] += roundGrain;
                }
                diffs[idx] -= roundGrain;
                grainCount--;
            }
        }
    }
    return out;
}

