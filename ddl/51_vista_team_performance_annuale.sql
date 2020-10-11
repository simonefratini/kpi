use kpi;
drop view if exists team_performance_annuale;
create view team_performance_annuale 
as
select
    g.group_id,
    g.description as team,
    w.is_high,
    ifnull(w.latenza, 0) as days,
    ifnull(w.devizione_standard, 0) as devizione_standard,
    ifnull(w.lavorati, 0) as bugs,
    ifnull(w.chiuso,0) as move_or_close, 
    round(100*w.chiuso/nullif(w.lavorati,0)) as ratio
from vgroup g
left join (select v.group_id,
            v.is_high,
            ceil(avg(latenza) / 1440) as latenza,
            ceil(stddev(latenza) / 1440) as devizione_standard,
            count(1) as lavorati,
            sum(move_or_close) as chiuso
       from (select id,
                tp.is_high,
                g.group_id,
                sum(timestampdiff(minute, aperto, ifnull(chiuso, now()))) latenza,
                min(if( isnull(chiuso), 0, 1)) as move_or_close
           from tmp_team_performance tp
           join vteam g on tp.user_id = g.user_id
          group by tp.id, tp.is_high, g.group_id) as v
    group by v.group_id,v.is_high) as w on w.group_id = g.group_id
union all  
select 0 as group_id,
       'All Teams - One Company' as team,
       is_high,
       ceil(avg(latenza)/1440) as days,
       ceil(stddev(latenza)/1440) as devizione_standard,
       count(1) as bugs,
       sum(move_or_close) as move_or_close,
       round(100*sum(move_or_close)/ifnull(count(1),0)) as ratio
  from (select id,
               is_high,
               sum(timestampdiff(minute, aperto, ifnull(chiuso, now()))) latenza,
               min(if( isnull(chiuso), 0, 1)) as move_or_close
         from  tmp_team_performance tp
         group by id, is_high) as v
    -- essendo group_id e team fissi posso fare il group by solo su is_high 
group by is_high

