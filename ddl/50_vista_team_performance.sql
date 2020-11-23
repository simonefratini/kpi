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
    ,ifnull(v.open_previous_month,0) as open_previous_month 
    ,ifnull(v.open_this_month,0) as open_this_month
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
        sum(if (newthismonth=0,1,0)) as open_previous_month
        sum(if (newthismonth>0,1,0)) as open_this_month
  from  (select tp.id,
                tp.is_high,
                g.group_id,
                date_format(aperto,'%Y-%m') as mese,
                sum(if (aperto > date_add(date_sub(date_add(last_day(aperto),interval 1 day),interval 1 month), interval 0 second),1,0)) newthismonth 
           from tmp_team_performance tp 
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
 -- un bugs e' ancora in carico di un gruppo se la data di chiusura e'   
 -- all'ultimo giorno del mese alle 23.59.59 per i mesi precendenti il corrente,  oppure per il mese corrente e' nulla
 where date_sub(date_add(last_day(aperto),interval 1 day),interval 1 second) = chiuso or chiuso is null
 group by g.group_id,tp.is_high,g.description,mese
) as p on p.mese = a.mese and p.group_id = a.group_id and p.is_high = a.is_high 
left join
(select v.group_id,
        v.is_high,
        v.mese,
        round(avg(latenza)/1440) as latenza,
        round(stddev(latenza)/1440) as deviazione_standard
  from  (select tp.id,
                tp.is_high,
                g.group_id,
                date_format(max_chiuso,'%Y-%m') mese,
                sum(timestampdiff(minute,aperto,ifnull(chiuso,now()))) latenza
           from tmp_team_performance tp 
           join vteam g on tp.user_id = g.user_id
           join (select tpm.id,gm.group_id,max(ifnull(tpm.chiuso,now())) as max_chiuso from tmp_team_performance tpm
                                                              join vteam gm on tpm.user_id = gm.user_id
                                                            group by tpm.id,gm.group_id) as m on m.id=tp.id and m.group_id = g.group_id

         group  by tp.id,is_high, g.group_id, mese
        ) as v
  group by v.group_id,v.is_high,v.mese) as l on l.mese = a.mese and l.group_id = a.group_id and l.is_high = a.is_high
order by a.mese;
