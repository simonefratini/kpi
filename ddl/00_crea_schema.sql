--
create database if not exists kpi;
-- utente specifico 
drop user if exists 'kpi'@localhost;
--
create user 'kpi'@'localhost' identified by 'kpi';
-- accesso totale allo schema 
grant all on kpi.* to 'kpi'@'localhost';
-- sola lettura a db di redmine
grant select on redmine.* to 'kpi'@'localhost';
flush privileges;
