<?php
	class Database {
		private $host = "localhost";
		private $db_name = "c2322296_postcodeDB";
		private $username = "c2322296_Admin";
		private $password = "NabeelAl!1207"; // Replace with your actual password
		public $conn;
		public function getConnection() {
			$this->conn = null;
			try {
				$this->conn = new mysqli($this->host, $this->username, $this->password, $this->db_name);
			} catch (mysqli_sql_exception $exception) {
				echo "Connection error: " . $exception->getMessage();
			}
			return $this->conn;
		}
	}
?>
