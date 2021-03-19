create or replace view gengiskhan_milestone as
select 

as "Month",
p.project_alias as "Project",
p.WBS as "WBS",
p.LOB as "LOB",
p.project_manager as "Project Manager", 
p.Site as "Site",
concat('=HYPERLINK("http://monitoring-helpdesk.fimer.com/issues/',i.id,'","',i.id,'")') as "Milestone Number",
p.project as "Milestone Redmine Project", 
convert(i.subject using ascii) as  "Milestone Name",
ifnull(concat(u.lastname,' ',u.firstname),'Not Assigned') as "Milestone Owner",
ifnull(t.description,'') as "Milestone Team Owner",
convert(i.description using ascii) "Milestone Description",
s.name as "Status",
i.due_date as "Due Date",
date(if (s.is_closed,i.closed_on,NULL)) as "Actual Date",
concat('=HYPERLINK("http://monitoring-helpdesk.fimer.com/issues/',ct.id,'","',ct.id,'")') as "Container ID",
convert(ct.description using ascii) as "Container"
from redmine.issues i
join redmine.issue_statuses s on i.status_id = s.id  
join vproject_custom p on p.project_id=i.project_id                 
left join redmine.issues ct on ct.id=i.parent_id and ct.tracker_id = 4                 
left join redmine.users u on u.id=i.assigned_to_id
left join kpi.vteam t on t.user_id = i.assigned_to_id    
where i.project_id in (384,406) -- ECL Gengiskhan
and i.tracker_id = 2 -- feature
order by i.due_date

    
