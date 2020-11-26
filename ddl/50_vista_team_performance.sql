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
    ,ifnull(y.aperto,0) as open_this_month
    ,ifnull(x.chiuso_assoluto,0) as close_assoluto
    ,ifnull(l.close_this_month,0) as close_this_month 
from ( 
select g.group_id, y.is_high, g.description as team, date_format(m.first_day,'%Y-%m') as mese from
v12months m
join (select distinct is_high from vpriority) as y
join vgroup g 
) a
left join 
-- aperti nel mese 
( select v.group_id,
	   v.is_high,       
       v.mese,
       count(1) as aperto 
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
  from tmp_team_performance tp) v 
  where year(chiuso) = year(aperto)
    and month(chiuso) = month(aperto)
  group by v.is_high, v.group_id, mese) as x on x.mese = a.mese and x.group_id = a.group_id and x.is_high = a.is_high
-- latenza 
left join
(select v.group_id,
        v.is_high,
        v.mese,
        round(avg(latenza)/1440) as latenza,
        round(stddev(latenza)/1440) as deviazione_standard,
        count(1) as chiuso_assoluto
  from  (select tp.id,
                tp.is_high,
                tp.group_id,
                date_format(max_chiuso,'%Y-%m') mese,
                sum(timestampdiff(minute,aperto,ifnull(chiuso,now()))) latenza
           from tmp_team_performance tp 
           join (select id,group_id,max(ifnull(chiuso,now())) as max_chiuso from tmp_team_performance group by id,group_id) as m on m.id=tp.id and m.group_id = tp.group_id
         group  by tp.id,is_high, tp.group_id, mese
        ) as v
  group by v.group_id,v.is_high,v.mese) as l on l.mese = a.mese and l.group_id = a.group_id and l.is_high = a.is_high
order by a.mese;
