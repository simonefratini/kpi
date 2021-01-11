<?php
require_once('./dao.php');
$dao  = new Dao();
$output_path='../datasource/';
function sql2jsonfile($connection, $query,$filepath) {
    try {
        echo $query.PHP_EOL;
        $statment = $connection->pdo->prepare($query);	
        $statment->execute();
        $cursor= $statment->fetchAll(PDO::FETCH_ASSOC);                   
        file_put_contents($filepath ,json_encode($cursor));
        echo "write file $filepath".PHP_EOL;
    } catch (PDOException $e) {
        echo $e->getMessage();
    } 
}
// #################################
// estrazione nomi dei progetti 
// distinct per gestire i sottoprogetti di primo livello
// #################################
$query = 'select v.description,v.project_id from vproject v join (select distinct project_id from vproject) d on d.project_id=v.id   order by description';
sql2jsonfile($dao,$query,$output_path.'project.json');
// #################################
// estrazione nomi dei gruppi 
// #################################
$query='select distinct description, group_id from vteam order by description';
sql2jsonfile($dao,$query,$output_path.'group.json');
// #################################
// estrazione situazione bugs 
// #################################
$query='select * from open_bugs';
sql2jsonfile($dao,$query,$output_path.'open_bugs.json');
// #################################
// estrazione bugs chiusi per root cause 
// #################################
$query='select * from close_bugs_root_cause';
sql2jsonfile($dao,$query,$output_path.'close_bugs_root_cause.json');
// #################################
// estrazione  performance mensili
// #################################
$query='select * from monthly_performance';
sql2jsonfile($dao,$query,$output_path.'monthly_performance.json');
// #################################
// estrazione  performance annuali 
// #################################
$query='select * from yearly_performance';
sql2jsonfile($dao,$query,$output_path.'yearly_performance.json');
// #################################
// estrazione milestone unica cella con json formattato
// #################################
$query='select * from ecl_milestone';
sql2jsonfile($dao,$query,$output_path.'ecl_milestone.json');
// #################################
// performance mensili per team 
// prima occorre lanciare la stored procedure
// #################################
$query='call team_performance';
$statment = $dao->pdo->prepare($query);	
$statment->execute();
$query='select * from team_performance';
sql2jsonfile($dao,$query,$output_path.'team_performance.json');
//# aggregazione 
$query='select * from team_performance_annuale';
sql2jsonfile($dao,$query,$output_path.'team_performance_annuale.json');
//# Salvo il timestamp dell'estrazioni in formato json
$query='select date_format(now(),"%Y-%m-%d %h:%i %p") as timestamp';
sql2jsonfile($dao,$query,$output_path.'timstamp.json');
