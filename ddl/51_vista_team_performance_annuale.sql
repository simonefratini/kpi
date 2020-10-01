use kpi;
drop view if exists team_performance_annuale;
create view team_performance_annuale 
as
SELECT
    g.group_id,
    g.description AS team,
    IFNULL(w.latenza, 0) AS days,
    IFNULL(w.lavorati, 0) AS bugs,
    ifnull(w.chiuso,0) as move_or_close, 
    round(100*w.chiuso/nullif(w.lavorati,0)) as ratio
FROM
    vgroup g
        LEFT JOIN
    (SELECT
        v.group_id,
            CEIL(AVG(latenza) / 1440) AS latenza,
            COUNT(1) AS lavorati,
            sum(move_or_close) as chiuso
    FROM
        (SELECT
        id,
            g.group_id,
            SUM(TIMESTAMPDIFF(MINUTE, aperto, IFNULL(chiuso, NOW()))) latenza,
            MIN(IF( isnull(chiuso), 0, 1)) AS move_or_close
    FROM
        tmp_team_performance tp
    JOIN vteam g ON tp.user_id = g.user_id
    GROUP BY id , g.group_id) AS v
    GROUP BY v.group_id) AS w ON w.group_id = g.group_id
UNION SELECT
    0 AS group_id,
    'All Teams - One Company' AS team,
    CEIL(AVG(latenza) / 1440) AS days,
    COUNT(1) AS bugs,
    sum(move_or_close) as move_or_close,
    round(100*sum(move_or_close)/ifnull(count(1),0)) as ratio
FROM
    (SELECT
        id,
            SUM(TIMESTAMPDIFF(MINUTE, aperto, IFNULL(chiuso, NOW()))) latenza,
            MIN(IF( isnull(chiuso), 0, 1)) as move_or_close
    FROM
        tmp_team_performance tp
    GROUP BY id) AS v
