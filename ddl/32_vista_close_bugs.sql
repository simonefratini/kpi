use kpi;
drop view if exists close_bugs_root_cause;
-- recupero tutti i close_bugs
create view close_bugs_root_cause as  
select p.project_id,
i.priority_id as peso,
ifnull(c.cause,'Not Set') as cause,
count(1) as bugs
from redmine.issues i
join redmine.issue_statuses s on i.status_id = s.id
join vproject p on p.id = i.project_id
left join (
    select p.project_id, customized_id as id, nullif(value,'') as cause
      from redmine.custom_values v
      join redmine.custom_fields_projects p on v.custom_field_id=p.custom_field_id
     where p.custom_field_id=32 -- root cause
       and customized_type='Issue') as c on c.project_id = p.project_id and c.id=i.id 
where tracker_id = 1 -- tracker bugs
and s.is_closed = 1-- bugs close 
group by p.project_id,peso,cause 
