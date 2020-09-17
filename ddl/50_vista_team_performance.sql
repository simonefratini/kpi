use kpi;
drop view if exists team_performance;
create view team_performance 
as
select a.mese
    ,a.group_id
    ,a.team 
    ,ifnull(v.latenza,0) as days
    ,ifnull(v.lavorati,0) as bugs
    ,ifnull(p.incarico,0) as stillown 
from ( 
select g.group_id,g.description as team,  date_format(mese,'%Y-%m') as mese from
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
join vgroup g 
) a
-- latenza
left join (select v.group_id,v.mese,ceil(avg(latenza)/1440) as latenza , count(1) as lavorati from (
select id,g.group_id,  date_format(aperto,'%Y-%m') as mese, sum(timestampdiff(minute,aperto,ifnull(chiuso,now()))) latenza from tmp_team_performance tp join vteam g on tp.user_id = g.user_id
group  by id, g.group_id, 3
) as v
group by 1,2) as v on v.mese = a.mese and v.group_id = a.group_id
left join (
select g.group_id,
	   g.description,
       date_format(aperto,'%Y-%m') mese,
       count(1) as incarico 
  from tmp_team_performance tp
  join vteam g on tp.user_id = g.user_id
 where date_sub(date_add(last_day(aperto),interval 1 day),interval 1 second) = chiuso or chiuso is null
 group by 1,2,3
) as p on p.mese = a.mese and p.group_id = a.group_id
order by a.mese;
