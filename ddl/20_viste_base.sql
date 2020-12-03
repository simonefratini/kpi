use kpi;


-- progetti
drop view if exists vproject;
create view vproject as select p.id, ifnull(p.parent_id,p.id) as project_id, p.name as description
from redmine.projects p
join (SELECT id  from redmine.projects
    where id IN (325,367,338,273,184,198,257,259)) progetti_padre
where p.id = progetti_padre.id
   or p.parent_id  = progetti_padre.id ;



-- vista di appoggio per i gruppi statici
drop view if exists vgroup;
create view  vgroup as 
select id as group_id, lastname as description  from redmine.users
where type = 'Group'
and lastname in (
'Connectivity'
,'Digital Hardware'
,'Embedded Control - Firmware'
,'Power Hardware'
,'Product Engineering'
,'Mechanical Designer'
,'DVT Reliability'
,'DVT Functional'
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
select group_id,description, group_id as user_id from vgroup
-- aggiungo gruppi necessari alla corretta visualizzazioni
-- nel caso dei bug dei progetti mi serve la distinzione tra non assigned e others
-- nel caso dei bug dei team mi server solo others come contenitore generico
union all 
select -1, 'Not Assigned', -1
union all 
select -2, 'Others', -2;



-- vista priority semplificata 
drop view if exists vpriority;
create view vpriority as 
select priority_id, is_high from
(select 3 as priority_id ,0 is_high union all -- low
select  4 as priority_id ,0 is_high union all -- normal
select  5 as priority_id ,1 is_high union all -- high
select  6 as priority_id ,1 is_high union all -- urgent
select  7 as priority_id ,1 is_high union all -- immediate
select 39 as priority_id ,0 is_high  -- not set
) as p;


-- vista dei mesi 
drop view if exists v12months;
create view v12months as 
select cast(date_format(mese, '%Y-%m-01') as date) as first_day from 
(select date_sub(now(), interval 0 month) as mese union all
select date_sub(now(), interval 1 month)  as mese union all
select date_sub(now(), interval 2 month)  as mese union all
select date_sub(now(), interval 3 month)  as mese union all
select date_sub(now(), interval 4 month)  as mese union all
select date_sub(now(), interval 5 month)  as mese union all
select date_sub(now(), interval 6 month)  as mese union all
select date_sub(now(), interval 7 month)  as mese union all
select date_sub(now(), interval 8 month)  as mese union all
select date_sub(now(), interval 9 month)  as mese union all
select date_sub(now(), interval 10 month) as mese union all
select date_sub(now(), interval 11 month) as mese) as v;

-- vista limite inferiore 12 mesi fa, dal primo del mese
drop view if exists day_minimun;
create view day_minimun as 
select min(first_day) as `day_min` from v12months;


-- vista categorie
drop view if exists vcategory;
create view vcategory as 
select c.id as category_id,
c.project_id,
trim(concat(if(cp.name is not null,concat(cp.name,' '),''),c.name)) as category
  from redmine.issue_categories c
  left join redmine.issue_categories cp on c.parent_id = cp.id
  join vproject p on p.project_id = c.project_id
order by 1;



