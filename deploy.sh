cwd=$(pwd)
echo "creazione schema kpi"
cd ddl
. go.sh
cd $cwd
cd export
echo "estrazione datasource"
. go.sh
cd $cwd
