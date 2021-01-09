

create or replace view ecl_milestone as
select
json_arrayagg(
json_merge(
json_object('milestone',i.subject),
json_object('project',p.name), 
json_object('relation',r.relation_type),
json_object('assigned',ifnull(concat(u.lastname,' ',u.firstname),'Not Assigned')),
json_object('id',b.id)
)) as json
from redmine.issues i
join redmine.issue_relations r on i.id=r.issue_to_id
join redmine.issues b on b.id=r.issue_from_id
join redmine.issue_statuses s on b.status_id = s.id 
join redmine.projects p on p.id=b.project_id
left join redmine.users u on u.id=b.assigned_to_id
where i.project_id = 388 -- ECL Milestone
and i.tracker_id = 2 -- feature
and s.is_closed=0 -- aperte
;




