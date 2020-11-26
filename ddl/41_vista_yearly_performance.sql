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
from (select distinct p.project_id,y.is_high from vproject p join vpriority y) a
left join (
-- aperti
select p.project_id,
    y.is_high,
    sum(s.is_closed) as chiusi,
    sum(1-s.is_closed) as aperti
from redmine.issues ri
join redmine.issue_statuses s on ri.status_id=s.id
join vpriority y on ri.priority_id = y.priority_id
join vproject p on p.id = ri.project_id
where ri.tracker_id = 1 -- tracker bugs
and ri.created_on >= (select day_min from day_minimun) 
group by p.project_id, y.is_high) as i on a.project_id = i.project_id and a.is_high =i.is_high
-- tempo medio di chiusura
left join (select p.project_id,
    y.is_high,
    round(avg(TIMESTAMPDIFF(day,created_on,closed_on))) daytoclose,
    round(stddev(TIMESTAMPDIFF(day,created_on,closed_on))) deviazione_standard
from redmine.issues ri
join redmine.issue_statuses s on ri.status_id=s.id
join vpriority y on ri.priority_id = y.priority_id
join vproject p on p.id = ri.project_id
where tracker_id = 1 -- tracker bugs
and ri.created_on >= (select day_min from day_minimun) 
and s.is_closed=1
group by p.project_id, y.is_high) as tm on a.project_id = tm.project_id and a.is_high =tm.is_high
left join (
-- aperti assoluti
select p.project_id,
    y.is_high,
    sum(s.is_closed) as chiusi,
    sum((1-s.is_closed)) as aperti
from redmine.issues ri
join redmine.issue_statuses s on ri.status_id=s.id
join vpriority y on ri.priority_id = y.priority_id
join vproject p on p.id = ri.project_id
where ri.tracker_id = 1 -- tracker bugs
group by p.project_id, y.is_high) as x  on a.project_id = x.project_id and a.is_high = x.is_high
-- tempo medio di chiusura assoluti
left join (
select p.project_id,
       y.is_high,
       round(avg(TIMESTAMPDIFF(day,created_on,closed_on))) daytoclose,
       round(stddev(TIMESTAMPDIFF(day,created_on,closed_on))) deviazione_standard 
from redmine.issues ri
join redmine.issue_statuses s on ri.status_id=s.id
join vpriority y on ri.priority_id = y.priority_id
join vproject p on p.id = ri.project_id
where tracker_id = 1 -- tracker bugs
and s.is_closed=1
group by p.project_id, y.is_high) as z on a.project_id = z.project_id and a.is_high = z.is_high
