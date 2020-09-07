import ConfigParser
import mysql.connector
import os.path
import logging
import sys
# create logger with 'FirstLast Application'
logger = logging.getLogger('export')
logger.debug('dao')

class dao:


    def __init__(self,schema):

        config = ConfigParser.ConfigParser()

        try:
            config.read(os.path.dirname(os.path.realpath(__file__))+'/config.cfg')
        except ConfigParser.ParsingError as err: 
            logger.error('Errore lettura config file {0}'.format(err))
            raise

        # Set some attributes
        self.dictionary = False
        self.host     = config.get(schema,'host')
        self.database = config.get(schema,'database')
        self.user     = config.get(schema,'user')
        self.password = config.get(schema,'password')
        try:
            self.port     = config.get(schema,'port')
        except ConfigParser.NoOptionError:
            logger.debug('No port parameter found, use standard port')
            self.port = 3306 
            pass

        try:            
            self.socket   = config.get(schema,'socket')
            logger.info('Unix Socket {0}'.format(self.socket))
        except ConfigParser.NoOptionError:
            logger.debug('No socket parameter found')
            self.socket  =  None
            pass
            
        try:
            self.db = mysql.connector.Connect(host=self.host,database=self.database,user=self.user,password=self.password, port=self.port, unix_socket=self.socket)
            logger.info('User {0} connected to {1}@{2}:{3}'.format(self.user,self.database,self.host,self.port))
        except mysql.connector.Error as err:
            logger.error('user {0} can not connect to {1}@{2}:{3}'.format(err, self.user,self.database,self.host,self.port))
            raise

        return

    def enable_dictionary(self):
        self.dictionary = True

    def disable_dictionary(self):
        self.dictionary = False
        

    def execute(self,query):

        try:
            logger.info('{0}'.format(query))
            cursor = self.db.cursor(buffered=True,dictionary = self.dictionary )
            cursor.execute(query)

        except mysql.connector.Error as err:
            logger.error('Error {0}'.format(err,query))
        return cursor

    # recuperara il valore della prima riga
    # mi server per le funzioni di aggregazione es. select count(1) from ...
    # non mi interessa avere dictionary attivo sempre disabilitato
    def execute_onerow(self,query):

        state = self.dictionary
        self.dictionary = False
        cursor = self.execute(query)
        if state:
            self.dictionary = True
        row = cursor.fetchone()
        cursor.close()
        return row


    def close():
        self.db.close()


    def verbose_action(self,action_type,row_count,row_aspected):
       logger.info("{0} row(s) {1}".format(action_type, row_count))
       if row_count != row_aspected:
           logger.error("DISCREPANCY on {0} row(s) {1} when row(s) aspected {2}".format(action_type,row_count,row_aspected))
           sys.exit(1) # esco sempre se c'e' discrepanza
        
           



