cwd=$(pwd)
echo "creazione schema kpi"
cd ddl
. install.sh
cd $cwd
cd backend 
echo "estrazione datasource"
. run.sh
cd $cwd
