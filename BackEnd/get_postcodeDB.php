<?php
	header('Content-Type: application/json');
	
	require 'Database.php';
	error_reporting(E_ALL);
	ini_set('display_errors', 1);
	
	$database = new Database();
	$conn = $database->getConnection();
	$sql = "SELECT * FROM tbl_postcodes";
	$result = $conn->query($sql);
	$data = [];
	
	if ($result->num_rows > 0) {
		while($row = $result->fetch_assoc()) {
			$data[] = $row;
		}
	}
	echo json_encode($data);
	
	$conn->close();
?>
