use kpi;
drop procedure if exists insert_spalmato_sui_mesi;
DELIMITER $$
CREATE PROCEDURE insert_spalmato_sui_mesi(p_id int, p_is_high int, p_user_id int,p_inizio datetime, p_fine datetime )
BEGIN
DECLARE v_group_id int default -2; -- others
select group_id
into v_group_id
from vteam
where user_id=p_user_id;
if v_group_id is null then
    -- gruppo the others
    set v_group_id = -2;
end if;
insert into tmp_team_performance (id, is_high, group_id, aperto, chiuso) values (p_id, p_is_high, v_group_id, p_inizio, p_fine);
end$$
DELIMITER ;

