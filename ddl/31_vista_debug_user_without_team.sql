use kpi;
drop view if exists orphan_users;
-- recupero tutti i gli open bugs
create view orphan_users as  
select project_id,id,assigned_to_id
from (
select p.project_id, i.id,i.assigned_to_id,g.group_id
from redmine.issues i
join redmine.issue_statuses s on s.id=i.status_id
join vproject p on p.id = i.project_id
left join vteam g on g.user_id = i.assigned_to_id
where tracker_id = 1 -- tracker bugs
and s.is_closed=0 -- bugs open
) as v 
where group_id is null
