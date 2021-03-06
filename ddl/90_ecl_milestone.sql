create or replace view ecl_milestone as
select
concat('=HYPERLINK("http://monitoring-helpdesk.fimer.com/issues/',i.id,'","',i.subject,'")') as "Month",
v.project_alias as "Project", 
v.WBS as "WBS",
v.LOB as "LOB",
v.project_manager as "Project Manager", 
v.Site as "Site",
concat('=HYPERLINK("http://monitoring-helpdesk.fimer.com/issues/',v.id,'","',v.id,'")') as "Milestone Number",
v.project as "Milestone Redmine Project", 
convert(v.subject using ascii) as  "Milestone Name",
v.assigned "Milestone Owner",
v.assigned_team "Milestone Team Owner",
convert(v.description using ascii) "Milestone Description",
v.status as "Status",
v.due_date as "Due Date",
date(v.closed_at) as "Actual Date",
concat('=HYPERLINK("http://monitoring-helpdesk.fimer.com/issues/',v.container_id,'","',v.container_id,'")') as "Container ID",
convert(v.container using ascii) as "Container"
from redmine.issues i
left join (
    select r.issue_to_id, -- relazione di partenza
           b.id,
           b.subject,
           b.description,
           ifnull(concat(u.lastname,' ',u.firstname),'Not Assigned') as assigned,
           ifnull(t.description,'') as assigned_team,
           p.*,   -- campi custom dei progetti        
           b.due_date,
           s.name as status,
           if (s.is_closed,b.closed_on,NULL) as closed_at,
           ct.id as container_id,
           ct.subject as "container"
      from redmine.issue_relations r
      join redmine.issues b on b.id=r.issue_from_id
      join redmine.issue_statuses s on b.status_id = s.id 
      left join vproject_custom p on p.project_id=b.project_id      
      left join redmine.issues ct on ct.id=b.parent_id and ct.tracker_id = 4           
  	  left join redmine.users u on u.id=b.assigned_to_id
      left join kpi.vteam t on t.user_id = b.assigned_to_id    
	) v on i.id=v.issue_to_id
where i.project_id = 388 -- ECL Milestone
and i.tracker_id = 2 -- feature
;




