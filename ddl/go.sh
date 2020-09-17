sudo mysql -v < 00_crea_schema.sql
DBUSER=kpi
DBPASSWORD=$DBUSER
SCHEMA=$DBUSER
mysql -u$DBUSER -p$DBPASSWORD -D$SCHEMA < 10_tabelle.sql
mysql -u$DBUSER -p$DBPASSWORD -D$SCHEMA < 20_viste_base.sql
# viste e procedure > 30
for i in $(ls -1 [3-9]*)
do
echo $i    
mysql -u$DBUSER -p$DBPASSWORD -D$SCHEMA < $i
done

