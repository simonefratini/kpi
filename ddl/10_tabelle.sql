use kpi;
drop table if exists tmp_team_performance;
CREATE TABLE tmp_team_performance (
    id int,
    user_id int,
    aperto datetime,
    chiuso datetime,
    unique(id,user_id,aperto)
);


