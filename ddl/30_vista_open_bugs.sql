use kpi;
drop view if exists open_bugs;
-- recupero tutti i gli open bugs
create view open_bugs as  
select p.project_id ,
-- gli stati che mi interessa sono
-- 9 under test
-- 1 new --> backlog
-- gli altri aperti (non ancora chiusi in progress, feedback, reopend, resolved ) gli rimappo con 2 in progress  
IF((`i`.`status_id` = 9), 9, IF((`i`.`status_id` = 1), 1, 2 )) as `stato`,
IFNULL(`g`.`description`, 'Not Assigned/Others') AS `team`,
i.priority_id as peso,
count(1) as bugs
from redmine.issues i
join vproject p on p.id = i.project_id
left join vteam g on g.user_id = i.assigned_to_id
where tracker_id = 1 -- tracker bugs
and closed_on is null -- bugs open
group by project_id,stato,team,priority_id;
