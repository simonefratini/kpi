use kpi;
drop procedure if exists insert_spalmato_sui_mesi;
DELIMITER $$
CREATE PROCEDURE insert_spalmato_sui_mesi(p_id int, p_is_high int, p_user_id int,p_inizio datetime, p_fine datetime )
BEGIN
DECLARE v_group_id int default null;
if p_user_id = 0 then
    set v_group_id = 0;
else    
    select group_id
    into v_group_id
    from vteam
    where user_id=p_user_id;
end if;
insert into tmp_team_performance (id, is_high, group_id, aperto, chiuso) values (p_id, p_is_high, v_group_id, p_inizio, p_fine);
end$$
DELIMITER ;

