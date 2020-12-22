use kpi;
drop view if exists team_performance;
create view team_performance 
as
select a.mese
    ,a.group_id
    ,a.team 
    ,a.is_high
    ,ifnull(l.latenza,0) as days
    ,ifnull(l.deviazione_standard,0) as deviazione_standard
    ,ifnull(y.open_this_month,0) as open_this_month
    ,ifnull(z.open_previous_month,0) as open_previous_month
    ,ifnull(x.close_this_month,0) as close_this_month 
    ,ifnull(w.close_absolute,0) as close_absolute
from ( 
select g.group_id, y.is_high, g.description as team, date_format(m.first_day,'%Y-%m') as mese from
v12months m
join (select distinct is_high from vpriority) as y
join (select distinct description, group_id from vteam) g 
) a
left join (
-- aperti mesi precedenti e ancora aperti
select v.group_id,
	   v.is_high,       
       date_format(m.first_day,'%Y-%m') as mese,
       count(1) as open_previous_month 
  from tmp_team_performance v 
  join v12months m -- creazione del cartesiano sui 12 mesi 
 where v.aperto < m.first_day -- creato nel mese
   and (v.chiuso is null or v.chiuso>=m.first_day) -- chiuso nel mese corrente e/o successivo oppure ancora aperto
group by v.is_high,v.group_id, mese) as z on z.mese = a.mese and z.group_id = a.group_id and z.is_high = a.is_high
left join (
-- aperti nel mese 
select v.group_id,
	   v.is_high,       
       v.mese,
       count(1) as open_this_month 
  from (select distinct tp.id, tp.is_high, tp.group_id, date_format(aperto,'%Y-%m') as mese from tmp_team_performance tp ) v 
  group by v.is_high, v.group_id, mese) as y on y.mese = a.mese and y.group_id = a.group_id and y.is_high = a.is_high
-- chiusi nel mese 
left join (
select v.group_id,
	   v.is_high,       
       mese,
       count(1) as close_this_month
 from (select distinct tp.id, tp.is_high, tp.group_id, date_format(aperto,'%Y-%m') as mese from tmp_team_performance tp  where last_day(chiuso) = last_day(aperto) and chiuso is not null) as v
  group by v.is_high, v.group_id, mese) as x on x.mese = a.mese and x.group_id = a.group_id and x.is_high = a.is_high
-- chiusi assoluti nel mese 
left join (
select v.group_id,
	   v.is_high,       
       mese,
       count(1) as close_absolute
 from (select distinct  tp.id, tp.is_high, tp.group_id, date_format(chiuso,'%Y-%m') as mese from tmp_team_performance tp where chiuso is not null ) as v
  group by v.is_high, v.group_id, mese) as w on w.mese = a.mese and w.group_id = a.group_id and w.is_high = a.is_high
-- latenza chiusi assoluti
left join
(select v.group_id,
        v.is_high,
        v.mese,
        round(avg(latenza)/1440) as latenza,
        round(stddev(latenza)/1440) as deviazione_standard
  from  (select tp.id,
                tp.is_high,
                tp.group_id,
                date_format(chiuso,'%Y-%m') as mese,
                sum(timestampdiff(minute,aperto,chiuso)) latenza
           from tmp_team_performance tp 
          where chiuso is not null 
         group  by tp.id,is_high, tp.group_id, mese
        ) as v
  group by v.group_id,v.is_high,v.mese) as l on l.mese = a.mese and l.group_id = a.group_id and l.is_high = a.is_high
order by a.mese;
