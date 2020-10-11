use kpi;
drop procedure if exists insert_spalmato_sui_mesi;
DELIMITER $$
CREATE PROCEDURE insert_spalmato_sui_mesi(p_id int, p_is_high int, p_user_id int,p_inizio datetime, p_fine datetime )
BEGIN
declare inizio_mese datetime default null;
declare fine_mese datetime default null;
set inizio_mese = p_inizio;
while inizio_mese < ifnull(p_fine,now()) do
	-- fine mese alle ore 23:59.59
	set fine_mese = date_sub(date_add(last_day(inizio_mese),interval 1 day),interval 1 second);
    if fine_mese >= ifnull(p_fine,now()) then
		set fine_mese = p_fine;
	end if;
	insert into tmp_team_performance (id, is_high, user_id, aperto, chiuso) values (p_id, p_is_high, p_user_id, inizio_mese, fine_mese);
  	-- sposto all'inizio del mese la finestra
    set inizio_mese = date_add(fine_mese,interval 1 second);
end while;
end$$
DELIMITER ;

