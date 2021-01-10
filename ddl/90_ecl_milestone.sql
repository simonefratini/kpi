create or replace view ecl_milestone as
select
json_arrayagg(
    json_merge(
json_object('milestone',i.subject),
json_object('description',i.description),
json_object('project',v.project), 
json_object('relation',v.relation_type),
json_object('assigned',v.assigned),
json_object('id',v.id),
json_object('due_date',v.due_date)
)) as json
from redmine.issues i
left join (
    select r.issue_to_id, -- relazione di partenza
           b.id,
           ifnull(concat(u.lastname,' ',u.firstname),'Not Assigned') as assigned,
           p.name as project,
           r.relation_type,
           b.due_date
      from redmine.issue_relations r
      join redmine.issues b on b.id=r.issue_from_id
      join redmine.issue_statuses s on b.status_id = s.id 
      join redmine.projects p on p.id=b.project_id
 left join redmine.users u on u.id=b.assigned_to_id
         ) v on i.id=v.issue_to_id
where i.project_id = 388 -- ECL Milestone
and i.tracker_id = 2 -- feature
;




