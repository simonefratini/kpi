use kpi;
drop procedure if exists insert_spalmato_sui_mesi;
DELIMITER $$
CREATE PROCEDURE insert_spalmato_sui_mesi(p_id int, p_is_high int, p_user_id int,p_inizio datetime, p_fine datetime )
BEGIN
insert into tmp_team_performance (id, is_high, user_id, aperto, chiuso) values (p_id, p_is_high, p_user_id, p_inizio, p_fine);
end$$
DELIMITER ;

