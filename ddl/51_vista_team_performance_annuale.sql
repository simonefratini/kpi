use kpi;
drop view if exists team_performance_annuale;
create view team_performance_annuale 
as
select  g.group_id
    ,g.description as team
    ,ifnull(w.latenza,0) as days
    ,ifnull(w.lavorati,0) as bugs
from  vgroup g
left join
(select v.group_id, ceil(avg(latenza)/1440) as latenza , count(1) as lavorati from (
select id,g.group_id, sum(timestampdiff(minute,aperto,ifnull(chiuso,now()))) latenza from tmp_team_performance tp
  join vteam g on tp.user_id = g.user_id
group  by id, g.group_id) as v
group by v.group_id) as w on w.group_id = g.group_id
union 
select 0 as group_id,'All Teams - One Company' as team, ceil(avg(latenza)/1440) as days , count(1) as bugs from (
select id, sum(timestampdiff(minute,aperto,ifnull(chiuso,now()))) latenza from tmp_team_performance tp
group  by id) as v

