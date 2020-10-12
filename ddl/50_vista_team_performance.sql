use kpi;
drop view if exists team_performance;
create view team_performance 
as
select a.mese
    ,a.group_id
    ,a.team 
    ,a.is_high
    ,ifnull(v.latenza,0) as days
    ,ifnull(v.deviazione_standard,0) as deviazione_standard
    ,ifnull(v.lavorati,0) as bugs
    ,ifnull(p.incarico,0) as stillown 
from ( 
select g.group_id, y.is_high, g.description as team, date_format(m.first_day,'%Y-%m') as mese from
v12months m
join (select distinct is_high from vpriority) as y
join vgroup g 
) a
-- latenza incrementale 
left join 
(select v.group_id,
        v.is_high,
        v.mese,
        round(avg(latenza)/1440) as latenza,
        round(stddev(latenza)/1440) as deviazione_standard,
        count(1) as lavorati 
  from  (select tp.id,
                tp.is_high,
                g.group_id,
                date_format(aperto,'%Y-%m') as mese,
                sum(timestampdiff(minute,tc.creato,ifnull(chiuso,now()))) latenza 
           from tmp_team_performance tp 
           -- con questa recupero la data di creazione del bugs 
           join (select id, min(aperto) as creato from tmp_team_performance group by id) tc on tc.id=tp.id
           join vteam g on tp.user_id = g.user_id
         group  by tp.id,is_high, g.group_id, mese
        ) as v
  group by v.group_id,v.is_high,v.mese) as v on v.mese = a.mese and v.group_id = a.group_id and v.is_high = a.is_high
-- posseduti alla fine del mese
left join (
select g.group_id,
       tp.is_high,
	   g.description,
       date_format(aperto,'%Y-%m') mese,
       count(1) as incarico 
  from tmp_team_performance tp
  join vteam g on tp.user_id = g.user_id
 -- per come e' fatto la tmp_team_performance, 
 -- un bugs e' ancora in carico di un gruppo se la data di chiusura s un mese precedente al corrente e' 
 -- all'ultimo giorno del mese alle 23.59.59  oppure per il mese corrente e' nulla
 where date_sub(date_add(last_day(aperto),interval 1 day),interval 1 second) = chiuso or chiuso is null
 group by g.group_id,tp.is_high,g.description,mese
) as p on p.mese = a.mese and p.group_id = a.group_id and p.is_high = a.is_high 
order by a.mese;
