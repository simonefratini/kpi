sudo mysql -v < 00_crea_schema.sql
set DBUSER=kpi
set DBPASSWORD=$DBUSER
set SCHEMA=$DBUSER
mysql -u$DBUSER -p$DBPASSWORD -D$SCHEMA -v < 10_tabelle.sql
mysql -u$DBUSER -p$DBPASSWORD -D$SCHEMA -v < 20_viste_base.sql
mysql -u$DBUSER -p$DBPASSWORD -D$SCHEMA -v < 30_vista_monthly_performance.sql
mysql -u$DBUSER -p$DBPASSWORD -D$SCHEMA -v < 30_vista_open_bugs.sql
mysql -u$DBUSER -p$DBPASSWORD -D$SCHEMA -v < 30_vista_team_performance.sql
mysql -u$DBUSER -p$DBPASSWORD -D$SCHEMA -v < 35_vista_team_performance_annuale.sql
mysql -u$DBUSER -p$DBPASSWORD -D$SCHEMA -v < 40_procedura_spalma_mesi.sql
mysql -u$DBUSER -p$DBPASSWORD -D$SCHEMA -v < 40_procedura_team_performance.sql
