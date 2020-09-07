use kpi;


-- progetti
drop view if exists vproject;
create view vproject as select p.id, ifnull(p.parent_id,p.id) as project_id, p.name as description
from redmine.projects p
join (SELECT id  from redmine.projects
    where id IN (325 , 367, 338)) progetti_padre
where p.id = progetti_padre.id
   or p.parent_id  = progetti_padre.id ;



-- vista di appoggio per i gruppi statici
drop view if exists vgroup;
create view  vgroup as 
select id as group_id, lastname as description  from redmine.users
where type = 'Group'
and lastname in ('Connectivity','Digital Hardware','Embedded Control - Firmware','Power Hardware','Product Engineering','Mechanical Designer',
'DVT Reliability'
,'DVT Functional'
,'DVT'
,'DVT Integration'
,'Project Management'
,'Product Engineering'
);


-- vista dei team comprensivi dei gruppi come utente
drop view if exists vteam;
create view vteam as 
select v.group_id,
v.description,
gu.user_id
from vgroup v
join redmine.groups_users gu on v.group_id = gu.group_id
union all
select group_id,group_id as user_id,description from vgroup;

