<?php
	header('Content-Type: application/json');

	require 'Database.php';
	error_reporting(E_ALL);
	ini_set('display_errors', 1);

	$data = json_decode(file_get_contents('php://input'), true);

	if (!$data || !isset($data['postcode']) || !isset($data['latitude']) || !isset($data['longitude'])) {
		echo json_encode(['status' => 'error', 'message' => 'Invalid input']);
		exit;
	}

	$postcode = $data['postcode'];
	$latitude = $data['latitude'];
	$longitude = $data['longitude'];

	$database = new Database();
	$conn = $database->getConnection();

	$sql = "SELECT postcode FROM tbl_postcodes WHERE postcode = ? LIMIT 1";
	$stmt = $conn->prepare($sql);
	$stmt->bind_param('s', $postcode);
	$stmt->execute();
	$result = $stmt->get_result();

	if ($result->num_rows > 0) {
		$updateQuery = "UPDATE tbl_postcodes SET latitude = ?, longitude = ? WHERE postcode = ? LIMIT 1";
		$stmt = $conn->prepare($updateQuery);
		$stmt->bind_param('dds', $latitude, $longitude, $postcode);

		if ($stmt->execute()) {
			echo json_encode(['status' => 'success', 'message' => 'Postcode updated successfully']);
		} else {
			echo json_encode(['status' => 'error', 'message' => 'Error updating postcode: ' . $conn->error]);
		}
	} else {
		$idQuery = "SELECT MIN(postcodeID + 1) AS missingID
                	FROM tbl_postcodes
                	WHERE (postcodeID + 1) NOT IN (SELECT postcodeID FROM tbl_postcodes)";
    	$idResult = $conn->query($idQuery);
		$missingID = $idResult->fetch_assoc()['missingID'];

		if (!$missingID) {
			$missingID = 1;
		}

		$insertQuery = "INSERT INTO tbl_postcodes (postcodeID, postcode, latitude, longitude) VALUES (?, ?, ?, ?)";
		$stmt = $conn->prepare($insertQuery);
		$stmt->bind_param('isdd', $missingID, $postcode, $latitude, $longitude);

		if ($stmt->execute()) {
			echo json_encode(['status' => 'success', 'message' => 'Postcode inserted successfully']);
		} else {
			echo json_encode(['status' => 'error', 'message' => 'Error inserting postcode: ' . $conn->error]);
		}
	}

	$stmt->close();
	$conn->close();
?>
