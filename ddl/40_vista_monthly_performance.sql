use kpi;
drop view if exists monthly_performance;
create view monthly_performance 
as
select a.project_id
    ,a.mese
    ,a.is_high 
    ,ifnull(c.chiusi,0) as chiusi
    ,ifnull(i.aperti,0) as aperti 
    ,ifnull(tm.daytoclose,0) as daytoclose
    ,ifnull(tm.chiusi_assoluto,0) as chiusi_assoluto 
-- cartesiano su 3 viste con distinct per i progetti
from ( select distinct p.project_id, y.*, date_format(m.first_day,'%Y-%m') as mese from v12months m join vproject p join vpriority y ) a
-- aperti
left join (select p.project_id,ri.priority_id, date_format(ri.created_on,'%Y-%m') as mese, count(1) aperti
from redmine.issues ri
join vproject p on p.id = ri.project_id
where ri.tracker_id = 1 -- tracker bugs
and ri.created_on >= (select day_min from day_minimun) 
group by p.project_id,ri.priority_id, mese) as i on a.mese = i.mese and a.project_id = i.project_id and a.priority_id = i.priority_id
-- chiusi nello stesso mese di apertura "ATTENZIONE RESTRIZIONE FORTE"
left join (select p.project_id,ri.priority_id, date_format(closed_on,'%Y-%m') as mese, count(1)  as chiusi
from redmine.issues ri
join vproject p on p.id = ri.project_id
where ri.tracker_id = 1 -- tracker bugs
and ri.created_on >= (select day_min from day_minimun) 
and year(closed_on) = year(created_on)
and month(closed_on) = month(created_on)
group by p.project_id,ri.priority_id, mese) as c on a.mese = c.mese and a.project_id = c.project_id and a.priority_id = c.priority_id
-- tempo medio di chiusura indipendente che siano stati aperti lo stesso mese
left join (select p.project_id,ri.priority_id, date_format(closed_on,'%Y-%m') as mese, count(1) chiusi_assoluto,  round(avg(TIMESTAMPDIFF(day,created_on,closed_on))) daytoclose
from redmine.issues ri
join vproject p on p.id = ri.project_id
where ri.tracker_id = 1 -- tracker bugs
and ri.created_on >= (select day_min from day_minimun) 
and ri.closed_on is not null 
group by p.project_id,ri.priority_id, mese) as tm on a.mese = tm.mese and a.project_id = tm.project_id and a.priority_id = tm.priority_id
order by a.mese;
