use kpi;
drop procedure if exists team_performance;
DELIMITER $$
CREATE PROCEDURE `team_performance`()
BEGIN

declare i int;
declare done INT default 0;
declare previous_id int default null;
declare previous_user_id varchar(255) default null;
declare previous_aperto datetime default null;
declare previous_modificato datetime default null;
declare previous_chiuso datetime default null;
-- variabili per il cursore
declare v_id int;
declare v_user_id varchar(255);
declare v_previous_user_id varchar(255);
declare v_aperto datetime;
declare v_modificato datetime;
declare v_chiuso datetime;
DECLARE cursore CURSOR FOR 
select i.id,
    ifnull(j.user_id,i.assigned_to_id) as user_id,
    j.previous_user_id,
    i.created_on as aperto ,
    j.created_on as modificato ,
    closed_on as chiuso 
from redmine.issues i 
join vproject p on p.id = i.project_id 
left join(
select journalized_id as id ,
       j.created_on,
       d.value as user_id,
       d.old_value  as previous_user_id
       from redmine.journals j 
       join redmine.journal_details d on j.id =  d.journal_id 
       where j.journalized_type='Issue' 
         and d.property = 'attr' 
         and d.prop_key = 'assigned_to_id' ) j on j.id = i.id        
where i.tracker_id = 1  
and i.created_on > date_add(last_day(date_sub(now(), interval 1 year)), interval 1 day)
order by id, j.created_on;
DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
-- fine cursore
-- pulizia della tabella temporanea
truncate table  tmp_team_performance;
open cursore;
giro:LOOP   
    FETCH cursore into v_id, v_user_id, v_previous_user_id, v_aperto, v_modificato, v_chiuso;        
    if previous_id != v_id and previous_aperto is not null then
		-- devo inserire riga precedente 
        call insert_spalmato_sui_mesi(previous_id,previous_user_id,previous_modificato,previous_chiuso);                 
        set previous_aperto = null;
    end if ;
    if done then 
        if previous_aperto is not null then
	    	-- devo inserire riga precedente 
            call insert_spalmato_sui_mesi(previous_id,previous_user_id,previous_modificato,previous_chiuso);                 
        end if;    
        leave giro; 
    end if;    
    -- se e' senza previous_user_id e' unica v_id è unico
     if v_previous_user_id is null then     
		-- posso inserire 
        call insert_spalmato_sui_mesi(v_id,v_user_id,v_aperto,v_chiuso);     	        
        -- reset totale
        set previous_id = null;
        set previous_user_id = null;
        set previous_aperto = null; 
        set previous_chiuso = null; 
     else
		 if previous_aperto is null  then
			set previous_aperto = v_aperto;            
        else
   			set previous_aperto = previous_modificato;            
		end if;                        
        set previous_modificato = v_modificato; 
        set previous_chiuso = v_chiuso;-- serve per l'ultima riga
		call insert_spalmato_sui_mesi(v_id,v_previous_user_id,previous_aperto,previous_modificato);             
		set previous_id = v_id;
        set previous_user_id = v_user_id;
	 end if;
end loop;
END$$
DELIMITER ;

