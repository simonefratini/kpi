<?php
require_once('conf.php');

class Dao {
    const DB_HOST  = KPI_HOST;
    const DB_USER  = KPI_USER;
    const DB_PASSWORD   = KPI_PWD;
    const DB_NAME   = KPI_DB;				
    public $pdo = null;
    public function __construct() {
        $conStr = sprintf("mysql:host=%s;dbname=%s", self::DB_HOST, self::DB_NAME);
        try {
            // open database connection
            $this->pdo = new PDO($conStr, self::DB_USER, self::DB_PASSWORD);
        } catch (PDOException $e) {
            die($e->getMessage());
        }
    }
	public function __destruct() { 
        $this->pdo = null;
	}
}

