import log
import sys
import csv 
import argparse
from datetime import datetime
import json
logger = log.setup_custom_logger('export')
logger.debug('main')
from dao import dao

def scrivi_csv(filename,cursor):
    result = cursor.fetchall();
    with open(filename, 'w') as f_handle:
        writer = csv.writer(f_handle)
        # Add the header/column names
        header = [i[0] for i in cursor.description]
        writer.writerow(header)
        for row in result:
            writer.writerow(row)
# #####################################
parser = argparse.ArgumentParser()
parser.add_argument("--environment",  default='DEV' )
parser.add_argument("--csv_output",  default='../datasource/')
args = parser.parse_args()
# #####################################
#######################################
csv_output_path =  args.csv_output
redmine = dao(args.environment)
# #################################
# estrazione nomi dei progetti 
# distinct per gestire i sottoprogetti di primo livello
# #################################
project = {}
cursor = redmine.execute('select v.description,v.project_id from vproject v join (select distinct project_id from vproject) d on d.project_id=v.id   order by description')
for p in  cursor.fetchall():
    project[p[0]]=p[1]
f = open(csv_output_path+'project.json','w')
f.write(json.dumps(project))
f.close
# #################################
# estrazione nomi dei gruppi 
# #################################
cursor = redmine.execute('select description, group_id from vgroup order by description')
group = {}
for p in  cursor.fetchall():
    group[p[0]]=p[1]
f = open(csv_output_path+'group.json','w')
f.write(json.dumps(group))
f.close
# #################################
# estrazione situazione bugs 
# #################################
cursor = redmine.execute('select * from open_bugs')
scrivi_csv(csv_output_path+'open_bugs.csv',cursor);
# #################################
# estrazione  performance mensili
# #################################
cursor = redmine.execute('select * from monthly_performance')
scrivi_csv(csv_output_path+'monthly_performance.csv',cursor);
# #################################
# estrazione  performance annuali 
# #################################
cursor = redmine.execute('select * from yearly_performance')
scrivi_csv(csv_output_path+'yearly_performance.csv',cursor);
# #################################
# performance mensili per team 
# prima occorre lanciare la stored procedure
# #################################
cursor = redmine.execute('call team_performance')
# mettere o non mettere il commit, se non lo metti i dati sono legati alla singola sessione
# vantaggio se la procedura ha qualche errore di overflow, per qualche motivo entra in loop di insert infinto, non si sporca filesystem
# riempe filesystem, poi la sessione va in crash e dovrebbe poi rilasciare lo spazio occupato
# svantaggio se devi fare debug dei dati devi ricaricare la tabella lanciando la procedura
#redmine.db.commit();
cursor = redmine.execute('select * from team_performance')
scrivi_csv(csv_output_path+'team_performance.csv',cursor);
## aggregazione 
cursor = redmine.execute('select * from team_performance_annuale')
scrivi_csv(csv_output_path+'team_performance_annuale.csv',cursor);
redmine.close
## Salvo il timestamp dell'estrazioni in formato json
a = { "timestamp": datetime.now().strftime(' %Y-%m-%d %I:%M %p')} 
f = open(csv_output_path+'timestamp.json','w')
f.write(json.dumps(a))
f.close
logger.info("Finish")
