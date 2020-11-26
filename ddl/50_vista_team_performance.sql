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
    ,ifnull(z.open_absolute,0) as open_absolute
    ,ifnull(x.close_this_month,0) as close_this_month 
    ,ifnull(w.close_absolute,0) as close_absolute
from ( 
select g.group_id, y.is_high, g.description as team, date_format(m.first_day,'%Y-%m') as mese from
v12months m
join (select distinct is_high from vpriority) as y
join vgroup g 
) a
left join 
-- aperti assoluti 
( select v.group_id,
	   v.is_high,       
       date_format(m.first_day,'%Y-%m') as mese,
       count(1) as open_absolute 
 from ( select  id,is_high,group_id,min(aperto) as aperto,ifnull(max(chiuso),now()) as chiuso from  tmp_team_performance group by id,is_high,group_id) v 
join v12months m -- creazione del cartesiano sui 12 mesi 
where v.aperto <= m.first_day  -- creato nel mese
and (v.chiuso is null or v.chiuso>=m.first_day) -- chiuso nel mese corrente e/o successivo oppure ancora aperto
group by v.is_high,v.group_id, mese) as z on z.mese = a.mese and z.group_id = a.group_id and z.is_high = a.is_high
left join 
-- aperti nel mese 
( select v.group_id,
	   v.is_high,       
       v.mese,
       count(1) as open_this_month 
from (select distinct  tp.id,
       tp.is_high,
       tp.group_id,
       date_format(aperto,'%Y-%m') as mese
  from tmp_team_performance tp) v 
  group by v.is_high, v.group_id, mese) as y on y.mese = a.mese and y.group_id = a.group_id and y.is_high = a.is_high
-- chiusi nel mese 
left join (
select v.group_id,
	   v.is_high,       
       v.mese,
       count(1) as close_this_month
from (select distinct  tp.id,
       tp.is_high,
       tp.group_id,
       date_format(chiuso,'%Y-%m') as mese
  from tmp_team_performance tp  
  where year(chiuso) = year(aperto)
    and month(chiuso) = month(aperto)
    and chiuso is not null) as v
  group by v.is_high, v.group_id, mese) as x on x.mese = a.mese and x.group_id = a.group_id and x.is_high = a.is_high
-- chiusi assoluti mese 
left join (
select v.group_id,
	   v.is_high,       
       v.mese,
       count(1) as close_absolute
from (select distinct  tp.id,
       tp.is_high,
       tp.group_id,
       date_format(chiuso,'%Y-%m') as mese
  from tmp_team_performance tp where tp.chiuso is not null) as v
  group by v.is_high, v.group_id, v.mese) as w on w.mese = a.mese and w.group_id = a.group_id and w.is_high = a.is_high
-- latenza and chiusi assoluti nel mese 
left join
(select v.group_id,
        v.is_high,
        v.mese,
        round(avg(latenza)/1440) as latenza,
        round(stddev(latenza)/1440) as deviazione_standard,
        count(1) as close_absolute
  from  (select tp.id,
                tp.is_high,
                tp.group_id,
                date_format(chiuso,'%Y-%m') as mese,
                sum(timestampdiff(minute,aperto,ifnull(chiuso,now()))) latenza
           from tmp_team_performance tp 
           join (select id,group_id,max(ifnull(chiuso,now())) as max_chiuso from tmp_team_performance group by id,group_id) as m on m.id=tp.id and m.group_id = tp.group_id
         group  by tp.id,is_high, tp.group_id, mese
        ) as v
  group by v.group_id,v.is_high,v.mese) as l on l.mese = a.mese and l.group_id = a.group_id and l.is_high = a.is_high
order by a.mese;
