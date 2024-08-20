<?php
	header('Content-Type: application/json');

	require 'Database.php';
	error_reporting(E_ALL);
	ini_set('display_errors', 1);

	$data = json_decode(file_get_contents('php://input'), true);

	if (!$data || !isset($data['postcodeID'])) {
		echo json_encode(['status' => 'error', 'message' => 'Invalid input']);
		exit;
	}

	$postcode = $data['postcodeID'];

	$database = new Database();
	$conn = $database->getConnection();

	$sql = "SELECT postcodeID FROM tbl_postcodes WHERE postcodeID = ? LIMIT 1";
	$stmt = $conn->prepare($sql);
	$stmt->bind_param('s', $postcode);
	$stmt->execute();
	$result = $stmt->get_result();

	if ($result->num_rows > 0) {
		$deleteQuery = "DELETE FROM tbl_postcodes WHERE postcodeID = ? LIMIT 1";
		$stmt = $conn->prepare($deleteQuery);
		$stmt->bind_param('s', $postcode);

		if ($stmt->execute()) {
			echo json_encode(['status' => 'success', 'message' => 'Postcode deleted successfully']);
		} else {
			echo json_encode(['status' => 'error', 'message' => 'Error deleting postcode: ' . $conn->error]);
		}
	} else {
		echo json_encode(['status' => 'error', 'message' => 'Postcode not found']);
	}

	$stmt->close();
	$conn->close();
?>
