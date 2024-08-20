<?php
	header('Content-Type: application/json');
	
	require_once 'Database.php';
	error_reporting(E_ALL);
	ini_set('display_errors', 1);
	
	session_start();
	
	$data = json_decode(file_get_contents('php://input'), true);
	if (!$data || !isset($data['username']) || !isset($data['password'])) {
		echo json_encode(['status' => 'error', 'message' => 'Invalid input']);
		exit;
	}
	$username = $data["username"];
	$password = $data["password"];
	
	$database = new Database();
	$conn = $database->getConnection();
	$sql = "SELECT * FROM tbl_users WHERE Username = ? LIMIT 1";
	$stmt = $conn->prepare($sql);
	$stmt->bind_param('s', $username);
	$stmt->execute();
	$result = $stmt->get_result();
	$user = $result->fetch_assoc();

	if ($user) {
		if (password_verify($password, $user["Password"])) {
			$_SESSION['user_id'] = $user['userID'];
			$_SESSION['username'] = $user['Username'];
			echo json_encode(['status' => 'success', 'message' => 'Login successful']);
		} else {
			echo json_encode(['status' => 'error', 'message' => 'Invalid password']);
		}
	} else {
		echo json_encode(['status' => 'error', 'message' => 'User not found']);
	}

	$stmt->close();
	$conn->close();
?>
