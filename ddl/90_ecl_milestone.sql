create or replace view ecl_milestone as

select
concat('=HYPERLINK("http://monitoring-helpdesk.fimer.com/issues/"',i.id,'","',i.id,'")') as milestone_id,
i.subject as milestone,
i.description,
v.project, 
v.relation_type as relation,
v.assigned,
concat('=HYPERLINK("http://monitoring-helpdesk.fimer.com/issues/',v.id,'","',v.id,'")') as id,
v.status,
v.closed_at,
v.due_date,
concat('=HYPERLINK("http://monitoring-helpdesk.fimer.com/issues/',v.container_id,'","',v.container_id,'")') as container_id,
v.container
from redmine.issues i
left join (
    select r.issue_to_id, -- relazione di partenza
           b.id,
           ifnull(concat(u.lastname,' ',u.firstname),'Not Assigned') as assigned,
           p.name as project,
           r.relation_type,
           b.due_date,
           s.name as status,
           if (s.is_closed,b.closed_on,NULL) as closed_at,
           ct.id as container_id,
           ct.subject as "container"
      from redmine.issue_relations r
      join redmine.issues b on b.id=r.issue_from_id
      join redmine.issue_statuses s on b.status_id = s.id 
      join redmine.projects p on p.id=b.project_id
      left join redmine.issues ct on ct.id=b.parent_id and ct.tracker_id = 4           
	left join redmine.users u on u.id=b.assigned_to_id
         ) v on i.id=v.issue_to_id
where i.project_id = 388 -- ECL Milestone
and i.tracker_id = 2 -- feature
;




