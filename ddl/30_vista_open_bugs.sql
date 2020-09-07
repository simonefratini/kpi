use kpi;
drop view if exists open_bugs;
create view open_bugs as  
select p.project_id , if(status_id=9,'under test','under development') stato, ifnull(g.description,'Others') team,
if(((i.priority_id >= 4) and (i.priority_id <= 7)), 1, 0) as peso,
count(1) as bugs
from redmine.issues i
join vproject p on p.id = i.project_id
left join vteam g on g.user_id = i.assigned_to_id
where tracker_id = 1 -- tracker bugs
and created_on > date_sub(now(), interval 1 year)
and closed_on is null
group by project_id,stato,team,peso;
