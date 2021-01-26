sudo mysql -v < 00_crea_schema.sql
DBUSER=kpi
DBPASSWORD=$DBUSER
SCHEMA=$DBUSER
mysql -u$DBUSER -p$DBPASSWORD -D$SCHEMA < 10_tabelle.sql
mysql -u$DBUSER -p$DBPASSWORD -D$SCHEMA < 11_viste_base.sql
# viste e procedure >= 20
for i in $(ls -1 [2-9]*)
do
echo $i    
mysql -u$DBUSER -p$DBPASSWORD -D$SCHEMA < $i
done

