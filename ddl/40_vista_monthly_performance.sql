use kpi;
drop view if exists monthly_performance;
create view monthly_performance 
as
select a.project_id
    ,a.mese
    ,ifnull(c.chiusi,0) as chiusi
    ,ifnull(i.aperti,0) as aperti 
    ,ifnull(tm.daytoclose,0) as daytoclose
from ( 
select distinct p.project_id,  date_format(mese,'%Y-%m') as mese from
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
select date_sub(now(), interval 11 month) as mese) finestra
join vproject p
) a
-- aperti
left join (select p.project_id, date_format(ri.created_on,'%Y-%m') as mese, count(1) aperti
from redmine.issues ri
join vproject p on p.id = ri.project_id
where ri.tracker_id = 1 -- tracker bugs
and ri.created_on > date_add(date_sub(last_day(date_sub(now(), interval 1 year)), interval 1 month),interval 1 day)
and ri.closed_on is null
group by p.project_id, mese) as i on a.mese = i.mese and a.project_id = i.project_id
-- chiusi nello stesso mese di apertura "ATTENZIONE RESTRIZIONE FORTE"
left join (select p.project_id, date_format(closed_on,'%Y-%m') as mese, count(1)  as chiusi
from redmine.issues ri
join vproject p on p.id = ri.project_id
where tracker_id = 1 -- tracker bugs
and created_on > date_add(date_sub(last_day(date_sub(now(), interval 1 year)), interval 1 month),interval 1 day)
and year(closed_on) = year(created_on)
and month(closed_on) = month(created_on)
group by p.project_id, mese) as c on a.mese = c.mese and a.project_id = c.project_id
-- tempo medio di chiusura indipendente che siano stati aperti lo stesso mese
left join (select p.project_id, date_format(closed_on,'%Y-%m') as mese, round(avg(TIMESTAMPDIFF(day,created_on,closed_on))) daytoclose
from redmine.issues ri
join vproject p on p.id = ri.project_id
where tracker_id = 1 -- tracker bugs
and created_on > date_add(date_sub(last_day(date_sub(now(), interval 1 year)), interval 1 month),interval 1 day)
and closed_on > date_add(date_sub(last_day(date_sub(now(), interval 1 year)), interval 1 month),interval 1 day)
group by p.project_id, mese) as tm on a.mese = tm.mese and a.project_id = tm.project_id
order by a.mese;
