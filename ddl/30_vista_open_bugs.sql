use kpi;
drop view if exists open_bugs;
create view open_bugs as  
select p.project_id ,
IF((`i`.`status_id` = 9), 'being validated', IF((`i`.`status_id` = 1), 'new', 'being fixed')) AS `stato`,
IFNULL(`g`.`description`, 'Others/Not Assigned') AS `team`,
i.priority_id as peso,
count(1) as bugs
from redmine.issues i
join vproject p on p.id = i.project_id
left join vteam g on g.user_id = i.assigned_to_id
where tracker_id = 1 -- tracker bugs
and created_on > date_sub(now(), interval 1 year)
and closed_on is null -- bugs open
group by project_id,stato,team,priority_id;
