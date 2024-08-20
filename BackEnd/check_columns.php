<?php
	header('Content-Type: application/json');

	require 'Database.php';
	error_reporting(E_ALL);
	ini_set('display_errors', 1);

	$database = new Database();
	$conn = $database->getConnection();

	// SQL queries to check if columns exist
	$latitude_query = "
		SELECT COUNT(*) AS column_exists
		FROM information_schema.COLUMNS 
		WHERE TABLE_NAME = 'tbl_postcodes'
		AND COLUMN_NAME = 'latitude'
		AND TABLE_SCHEMA = DATABASE();
	";
	$longitude_query = "
		SELECT COUNT(*) AS column_exists
		FROM information_schema.COLUMNS 
		WHERE TABLE_NAME = 'tbl_postcodes'
		AND COLUMN_NAME = 'longitude'
		AND TABLE_SCHEMA = DATABASE();
	";

	$latitude_result = $conn->query($latitude_query);
	$longitude_result = $conn->query($longitude_query);

	$latitude_exists = $latitude_result->fetch_assoc()['column_exists'] > 0;
	$longitude_exists = $longitude_result->fetch_assoc()['column_exists'] > 0;

	if (!$latitude_exists || !$longitude_exists) {
		$sql = "ALTER TABLE tbl_postcodes";

		if (!$latitude_exists) {
			$sql .= " ADD COLUMN latitude DECIMAL(9, 6)";
		}

		if (!$longitude_exists) {
			if (!$latitude_exists) {
				$sql .= ",";
			}
			$sql .= " ADD COLUMN longitude DECIMAL(9, 6)";
		}

		$sql .= ";";

		if ($conn->query($sql) === TRUE) {
			echo json_encode(['status' => 'success', 'message' => 'Columns added successfully.']);
		} else {
			echo json_encode(['status' => 'error', 'message' => 'Error adding columns: ' . $conn->error]);
		}
	} else {
		echo json_encode(['status' => 'success', 'message' => 'Columns already exist.']);
	}

	$conn->close();
?>
