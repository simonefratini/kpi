use kpi;
drop view if exists yearly_performance;
create view yearly_performance 
as
select a.project_id
    ,ifnull(i.chiusi,0) as chiusi
    ,ifnull(i.aperti,0) as aperti
    ,ifnull(tm.daytoclose,0) as daytoclose
    ,ifnull(x.chiusi,0) as chiusi_assoluti
    ,ifnull(x.aperti,0) as aperti_assoluti
    ,ifnull(z.daytoclose,0) as daytoclose_assoluti
from (select distinct p.project_id  from vproject p) a
left join (
-- aperti
select p.project_id,
    sum(if(closed_on is not null,1,0)) as chiusi,
    sum(if(closed_on is null,1,0)) as aperti
from redmine.issues ri
join vproject p on p.id = ri.project_id
where ri.tracker_id = 1 -- tracker bugs
and ri.created_on > date_add(date_sub(last_day(date_sub(now(), interval 1 year)), interval 1 month),interval 1 day)
group by p.project_id) as i on a.project_id = i.project_id
-- tempo medio di chiusura
left join (select p.project_id, round(avg(TIMESTAMPDIFF(day,created_on,closed_on))) daytoclose
from redmine.issues ri
join vproject p on p.id = ri.project_id
where tracker_id = 1 -- tracker bugs
and created_on > date_add(date_sub(last_day(date_sub(now(), interval 1 year)), interval 1 month),interval 1 day)
and closed_on is not null
group by p.project_id) as tm on a.project_id = tm.project_id
left join (
-- aperti assoluti
select p.project_id,
    sum(if(closed_on is not null,1,0)) as chiusi,
    sum(if(closed_on is null,1,0)) as aperti
from redmine.issues ri
join vproject p on p.id = ri.project_id
where ri.tracker_id = 1 -- tracker bugs
group by p.project_id) as x  on a.project_id = x.project_id
-- tempo medio di chiusura assoluti
left join (select p.project_id, round(avg(TIMESTAMPDIFF(day,created_on,closed_on))) daytoclose
from redmine.issues ri
join vproject p on p.id = ri.project_id
where tracker_id = 1 -- tracker bugs
and closed_on is not null
group by p.project_id) as z on a.project_id = z.project_id;
