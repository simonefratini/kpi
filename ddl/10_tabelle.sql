use kpi;
drop table if exists tmp_team_performance;
CREATE TABLE tmp_team_performance (
    id int,
    is_high int,
    group_id int,
    aperto datetime,
    chiuso datetime,
    unique(id,group_id,aperto)
);


