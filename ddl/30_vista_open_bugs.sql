use kpi;
drop view if exists open_bugs;
-- recupero tutti i gli open bugs
create view open_bugs as  
select v.project_id ,
v.stato,
IFNULL(`g`.`description`, 'Others') AS `team`,
IFNULL(g.group_id,-2) as group_id,
v.peso,
count(1) as bugs
from 
(select p.project_id ,
ifnull(i.assigned_to_id,-1) as user_id,
-- gli stati che mi interessa sono
-- 9 under test
-- 1 new che diventara backlog
-- gli altri aperti (non ancora chiusi in progress, feedback, reopend, resolved ) gli rimappo con 2 in progress  
IF((`i`.`status_id` = 9), 9, IF((`i`.`status_id` = 1), 1, 2 )) as `stato`,
i.priority_id as peso
from redmine.issues i
join redmine.issue_statuses s on i.status_id = s.id
join vproject p on p.id = i.project_id
where tracker_id = 1 -- tracker bugs
and i.status_id !=7 -- escludo gli on-hold
and s.is_closed=0 -- bugs open
) as v 
left join vteam g on g.user_id = v.user_id
group by v.project_id,v.stato,team,group_id,v.peso;
