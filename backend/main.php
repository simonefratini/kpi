<?php
require_once('./dao.php');
require 'vendor/autoload.php';
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
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
function sql2excel($connection, $query,$filepath) {
    try {
        echo $query.PHP_EOL;
        $statment = $connection->pdo->prepare($query);	
        $statment->execute();
        $cursor= $statment->fetchAll(PDO::FETCH_ASSOC);                   

        $spreadsheet = new Spreadsheet();
        // titolo con data della creazione 
        $spreadsheet->getActiveSheet()->setTitle(date("Ymd_Hi"));
        // Header
        $spreadsheet->getActiveSheet()->fromArray(array_keys(current($cursor)),null,'A1');
        // bold prima riga con gli header
        $spreadsheet->getActiveSheet()->getStyle('1:1')->getFont()->setBold(true);
        $spreadsheet->getActiveSheet()->fromArray($cursor,null,'A2');
        // filtro automatico 
        $spreadsheet->getActiveSheet()->setAutoFilter($spreadsheet->getActiveSheet()->calculateWorksheetDimension());
        $writer = new Xlsx($spreadsheet);
        $writer->save($filepath);
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
sql2excel($dao,$query,$output_path.'ecl_milestone.xlsx');
// #################################
// estrazione progetti gengiskhan unica cella con json formattato
// #################################
$query='select * from gengiskhan_milestone';
sql2jsonfile($dao,$query,$output_path.'gengiskhan_milestone.json');
sql2excel($dao,$query,$output_path.'gengiskhan_milestone.xlsx');
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

//# bug aperti dal team  
$query='select * from team_author_open_bugs';
sql2jsonfile($dao,$query,$output_path.'team_author_open_bugs.json');
# bug chiusi root cause vs team autore 
$query='select * from close_bugs_root_cause_vs_author_team';
sql2jsonfile($dao,$query,$output_path.'close_bugs_root_cause_vs_author_team.json');
# 
//# Salvo il timestamp dell'estrazioni in formato json
$query='select date_format(now(),"%Y-%m-%d %h:%i %p") as timestamp';
sql2jsonfile($dao,$query,$output_path.'timestamp.json');


