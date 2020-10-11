use kpi;
drop view if exists yearly_performance;
create view yearly_performance 
as
select a.project_id
    ,a.is_high
    ,ifnull(i.chiusi,0) as chiusi
    ,ifnull(i.aperti,0) as aperti
    ,ifnull(tm.daytoclose,0) as daytoclose
    ,ifnull(tm.deviazione_standard,0) as deviazione_standard
    ,ifnull(x.chiusi,0) as chiusi_assoluti
    ,ifnull(x.aperti,0) as aperti_assoluti
    ,ifnull(z.daytoclose,0) as daytoclose_assoluti
    ,ifnull(z.deviazione_standard,0) as deviazione_standard_assoluti
from (select distinct p.project_id,y.* from vproject p join vpriority y) a
left join (
-- aperti
select p.project_id,
    ri.priority_id,
    sum(if(closed_on is not null,1,0)) as chiusi,
    sum(if(closed_on is null,1,0)) as aperti
from redmine.issues ri
join vproject p on p.id = ri.project_id
where ri.tracker_id = 1 -- tracker bugs
and ri.created_on >= (select day_min from day_minimun) 
group by p.project_id, ri.priority_id) as i on a.project_id = i.project_id and a.priority_id =i.priority_id
-- tempo medio di chiusura
left join (select p.project_id,
    ri.priority_id,
    round(avg(TIMESTAMPDIFF(day,created_on,closed_on))) daytoclose,
    round(stddev(TIMESTAMPDIFF(day,created_on,closed_on))) deviazione_standard
from redmine.issues ri
join vproject p on p.id = ri.project_id
where tracker_id = 1 -- tracker bugs
and ri.created_on >= (select day_min from day_minimun) 
and closed_on is not null
group by p.project_id, ri.priority_id) as tm on a.project_id = tm.project_id and a.priority_id =tm.priority_id
left join (
-- aperti assoluti
select p.project_id,
    ri.priority_id,
    sum(if(closed_on is not null,1,0)) as chiusi,
    sum(if(closed_on is null,1,0)) as aperti
from redmine.issues ri
join vproject p on p.id = ri.project_id
where ri.tracker_id = 1 -- tracker bugs
group by p.project_id, ri.priority_id) as x  on a.project_id = x.project_id and a.priority_id = x.priority_id
-- tempo medio di chiusura assoluti
left join (
select p.project_id,
       ri.priority_id,
       round(avg(TIMESTAMPDIFF(day,created_on,closed_on))) daytoclose,
       round(stddev(TIMESTAMPDIFF(day,created_on,closed_on))) deviazione_standard 
from redmine.issues ri
join vproject p on p.id = ri.project_id
where tracker_id = 1 -- tracker bugs
and closed_on is not null
group by p.project_id, ri.priority_id) as z on a.project_id = z.project_id and a.priority_id = z.priority_id
