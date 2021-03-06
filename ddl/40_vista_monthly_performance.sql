use kpi;
drop view if exists monthly_performance;
create view monthly_performance 
as
select a.project_id
    ,a.mese
    ,a.is_high 
    ,ifnull(c.chiusi,0) as chiusi
    ,ifnull(i.aperti,0) as aperti 
    ,ifnull(j.aperti_mesi_precedenti,0) as aperti_mesi_precedenti 
    ,ifnull(tm.daytoclose,0) as daytoclose
    ,ifnull(tm.deviazione_standard,0) as deviazione_standard
    ,ifnull(tm.chiusi_assoluto,0) as chiusi_assoluto 
-- cartesiano su 3 viste con distinct per i progetti
from ( select distinct p.project_id, y.is_high, date_format(m.first_day,'%Y-%m') as mese from v12months m join vproject p join vpriority y ) a
-- aperti nel mese
left join (select p.project_id,y.is_high, date_format(ri.created_on,'%Y-%m') as mese, count(1) aperti
from redmine.issues ri
join vpriority y on y.priority_id = ri.priority_id
join vproject p on p.id = ri.project_id
where ri.tracker_id = 1 -- tracker bugs
and ri.status_id !=7 -- escludo gli on-hold
and ri.created_on >= (select day_min from day_minimun) 
group by p.project_id,y.is_high, mese) as i on a.mese = i.mese and a.project_id = i.project_id and a.is_high = i.is_high
-- aperti mesi precedenti 
left join (select p.project_id,y.is_high, date_format(m.first_day,'%Y-%m') as mese, count(1) aperti_mesi_precedenti
from redmine.issues ri
join redmine.issue_statuses s on ri.status_id=s.id
join vpriority y on y.priority_id = ri.priority_id
join vproject p on p.id = ri.project_id
join v12months m -- creazione del cartesiano sui 12 mesi 
where ri.tracker_id = 1 -- tracker bugs
and ri.status_id !=7 -- escludo gli on-hold
and ri.created_on < m.first_day  -- creato nei mesi precedenti 
and (s.is_closed=0 or (s.is_closed=1 and ri.closed_on > m.first_day)) -- aperto oppure chiuso dal mese corrente
group by p.project_id,y.is_high, mese) as j on a.mese = j.mese and a.project_id = j.project_id and a.is_high = j.is_high
-- chiusi nello stesso mese di apertura "ATTENZIONE RESTRIZIONE FORTE"
left join (select p.project_id,y.is_high, date_format(closed_on,'%Y-%m') as mese, count(1)  as chiusi
from redmine.issues ri
join redmine.issue_statuses s on ri.status_id=s.id
join vpriority y on y.priority_id = ri.priority_id
join vproject p on p.id = ri.project_id
where ri.tracker_id = 1 -- tracker bugs
and ri.status_id !=7 -- escludo gli on-hold
and ri.created_on >= (select day_min from day_minimun) 
and last_day(ri.closed_on) = last_day(ri.created_on) 
and s.is_closed=1 
group by p.project_id,y.is_high, mese) as c on a.mese = c.mese and a.project_id = c.project_id and a.is_high = c.is_high
-- tempo medio di chiusura indipendente che siano stati aperti lo stesso mese
left join (select p.project_id,y.is_high, date_format(closed_on,'%Y-%m') as mese,
                  count(1) chiusi_assoluto,
                  round(avg(TIMESTAMPDIFF(day,created_on,closed_on))) daytoclose,
                  round(stddev(TIMESTAMPDIFF(day,created_on,closed_on))) deviazione_standard
from redmine.issues ri
join redmine.issue_statuses s on ri.status_id=s.id
join vpriority y on y.priority_id = ri.priority_id
join vproject p on p.id = ri.project_id
where ri.tracker_id = 1 -- tracker bugs
and ri.status_id !=7 -- escludo gli on-hold
and ri.closed_on >= (select day_min from day_minimun) 
and s.is_closed=1 
group by p.project_id,y.is_high, mese) as tm on a.mese = tm.mese and a.project_id = tm.project_id and a.is_high = tm.is_high
order by a.mese;
