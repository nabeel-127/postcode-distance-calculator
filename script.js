// Entry
document.addEventListener('DOMContentLoaded', () => {
	checkAuthentication();
	checkColumns();
	initialiseVariables();
	getPostcodeDB().then(() => {
		addEventListeners();
	});
	// console.log("DOMContentLoaded completed");
});

// Variable initialisation
const URL = "./";
let postcodeList;
let postcodeDropdown1;
let postcodeDropdown2;
let loginInfo = {};
let currentPage = 1;
let filteredPostcodes = "";
const rowsPerPage = 5;
let incorrectLogin;

function initialiseVariables() {
	postcodeDropdown1 = document.getElementById('postcode-dropdown-1');
	postcodeDropdown2 = document.getElementById('postcode-dropdown-2');
	incorrectLogin = document.getElementById('incorrect-login');
}
function fetchPHP(fileAddress, body = null) {
	let fetchOptions = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
	}
	if (body) {
		fetchOptions.body = JSON.stringify(body);
	}
	return fetch(URL + fileAddress, fetchOptions)
	.then(response => response.json())
}

function fetchPostcode() {
	// let postcodeID = document.getElementsByName('postcodeID')[0].value;
	// let postcode = document.getElementsByName('postcode')[0].value;
	// let latitude = document.getElementsByName('latitude')[0].value;
	// let longitude = document.getElementsByName('longitude')[0].value;
	postcodeInput = document.getElementsByName('postcode')[0];
	let postcode = postcodeInput.value;
	if (!/^[a-zA-Z0-9]+$/.test(postcode) || postcode.length > 7) {
		postcodeInput.setCustomValidity("Postcode can only contain letters and numbers and must be less than 8 characters.");
        postcodeInput.reportValidity();
		return;
	} else if (postcode.length == 0) {
		postcodeInput.setCustomValidity("Please enter a postcode to search.");
        postcodeInput.reportValidity();
		return;
	}

	fetch(`https://api.postcodes.io/postcodes/${postcode}`)
	.then(response => {
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
	return response.json();
	})
	.then(data => {
		const postcodeInfo = data.result;
		document.getElementsByName('latitude')[0].value = postcodeInfo.latitude;
		document.getElementsByName('longitude')[0].value = postcodeInfo.longitude;
		getPostcodeDB();
	})
	.catch(error => {
		alert('Postcode not found. Please check the postcode and try again.');
		console.error('fetchPostcode(): ', error);
	});
}

function setupPagination() {
	const pagination = document.getElementById('pagination');
	pagination.innerHTML = '';

	const totalPages = Math.ceil(postcodeList.length / rowsPerPage);

	for (let i = 1; i <= totalPages; i++) {
		const pageBtn = document.createElement('button');
		pageBtn.innerText = i;
		pageBtn.style.cursor = 'pointer';
		pageBtn.addEventListener('click', () => {
			currentPage = i;
			displayPostcodes();
		});
		pagination.appendChild(pageBtn);
	}
}
function setupFilteredPagination() {
	const pagination = document.getElementById('pagination');
	pagination.innerHTML = '';

	const totalPages = Math.ceil(filteredPostcodes.length / rowsPerPage);

	for (let i = 1; i <= totalPages; i++) {
		const pageBtn = document.createElement('button');
		pageBtn.innerText = i;
		pageBtn.style.cursor = 'pointer';
		pageBtn.addEventListener('click', () => {
			currentPage = i;
			displayFilteredPostcodes();
		});
		pagination.appendChild(pageBtn);
	}
}

function displayPostcodes() {
	// let currentPage = 1;
	const rowsPerPage = 5;

	const tableBody = document.getElementById('postcode-table-body');
	tableBody.innerHTML = '';

	const start = (currentPage - 1) * rowsPerPage;
	const end = start + rowsPerPage;
	const paginatedPostcodes = postcodeList.slice(start, end);

	paginatedPostcodes.forEach(postcode => {
		const row = document.createElement('tr');
		row.innerHTML = `
			<td>${postcode.postcodeID}</td>
			<td>${postcode.postcode}</td>
			<td>${postcode.latitude}</td>
			<td>${postcode.longitude}</td>
			<td>
				<button onclick="editPostcode(${postcode.postcodeID})" style="color: green; cursor: pointer;">Edit</button>
				<button onclick="deletePostcode(${postcode.postcodeID})" style="color: red; cursor: pointer;">Delete</button>
			</td>
		`;
		tableBody.appendChild(row);
	});

	setupPagination();
}
function displayFilteredPostcodes() {
	const rowsPerPage = 5;

	const tableBody = document.getElementById('postcode-table-body');
	tableBody.innerHTML = '';

	const start = (currentPage - 1) * rowsPerPage;
	const end = start + rowsPerPage;
	const paginatedPostcodes = filteredPostcodes.slice(start, end);

	paginatedPostcodes.forEach(postcode => {
		const row = document.createElement('tr');
		row.innerHTML = `
			<td>${postcode.postcodeID}</td>
			<td>${postcode.postcode}</td>
			<td>${postcode.latitude}</td>
			<td>${postcode.longitude}</td>
			<td>
				<button onclick="editPostcode(${postcode.postcodeID})" style="color: green; cursor: pointer;">Edit</button>
				<button onclick="deletePostcode(${postcode.postcodeID})" style="color: red; cursor: pointer;">Delete</button>
			</td>
		`;
		tableBody.appendChild(row);
	});
	setupFilteredPagination();
}
function searchPostcodes() {
	const query = document.getElementById('search-box').value.toLowerCase();

	currentPage = 1;

	filteredPostcodes = postcodeList.filter(postcode => 
		postcode.postcode.toLowerCase().includes(query) ||
		postcode.latitude.toString().includes(query) ||
		postcode.longitude.toString().includes(query)
	);
	displayFilteredPostcodes();
}

function deletePostcode(postcodeID) {
	fetchPHP('delete_postcode.php', { postcodeID: postcodeID })
	.then(data => {
		// console.log(data.message);
		resetPostcodeDropdown();
		getPostcodeDB();
	})
	.catch(error => {
		console.error('updatePostcodeDB(): ', error);
	});
}

function editPostcode(postcodeID) {
	const postcode = postcodeList.find(p => p.postcodeID == postcodeID);
	if (postcode) {
		document.getElementById('postcodeID').value = postcode.postcodeID;
		document.getElementById('postcode').value = postcode.postcode;
		document.getElementById('latitude').value = postcode.latitude;
		document.getElementById('longitude').value = postcode.longitude;
		// document.getElementById('postcode-modal').style.display = 'block';
	}
}

function updatePostcodeDB(event) {
	event.preventDefault();
	// let postcodeID = document.getElementsByName('postcodeID')[0].value;
	let postcode = document.getElementsByName('postcode')[0].value;
	let latitude = document.getElementsByName('latitude')[0].value;
	let longitude = document.getElementsByName('longitude')[0].value;
	if (!/^[a-zA-Z0-9]+$/.test(postcode)) {
		alert("Postcode can only contain letters and numbers.");
		return;
	}
	if (isNaN(latitude) || isNaN(longitude)) {
		alert("Latitude and longitude must be valid numbers.");
		return;
	}
	postcodeInfo = {
		// postccodeID: postcodeID,
		postcode: postcode,
		latitude: latitude,
		longitude: longitude
	}
	fetchPHP('update_postcodeDB.php', postcodeInfo)
	.then(data => {
		// console.log(data.message);
		resetPostcodeDropdown();
		getPostcodeDB();
	})
	.catch(error => {
		console.error('updatePostcodeDB(): ', error);
	});
}

function addEventListeners() {
	postcodeDropdown1.addEventListener('change', calculateDistance);
	postcodeDropdown2.addEventListener('change', calculateDistance);
	if (window.location.href.includes('dashboard.html')) {
		document.getElementById('search-box').addEventListener('keyup', searchPostcodes);
		
		document.getElementsByName('postcode')[0].addEventListener('input', () => {
			document.getElementsByName('postcode')[0].setCustomValidity('');
		});
		// document.getElementsByName('latitude')[0].addEventListener('input', () => {
		// 	document.getElementsByName('latitude')[0].setCustomValidity('');
		// });
		// document.getElementsByName('longitude')[0].addEventListener('input', () => {
		// 	document.getElementsByName('longitude')[0].setCustomValidity('');
		// });
	}
}
function checkColumns() {
	fetch('check_columns.php')
	.then(response => response.json())
	.then(data => {})
	.catch(error => {
		console.error('checkColumns(): ', error);
	});
}
function checkAuthentication() {
	if (document.URL.includes('index.html')) {
		return;
	}
	fetch('check_authentication.php')
	.then(response => response.json())
	.then(data => {
		if (data.loggedIn !== true) {
			window.location.href = 'index.html';
		}
	})
	.catch(error => {
		console.error('checkAuthentication(): ', error);
		window.location.href = 'index.html';
	});
}

function logout() {
	fetchPHP('logout.php')
	.then(data => {
		if (data.status === 'success') {
			window.location.href = 'index.html';
		} else {
			console.error('Logout error: ', data.message);
		}
	})
	.catch(error => {
		console.error('logout(): ', error);
	});
}
function login(event) {
	event.preventDefault();
	let username = document.getElementsByName('username')[0].value;
	let password = document.getElementsByName('password')[0].value;
	loginInfo = {
		username: username,
		password: password
	}
	fetchPHP('login.php', loginInfo)
	.then(data => {
		if (data.status === 'success') {
			window.location.href = 'dashboard.html';
		} else {
			incorrectLogin.textContent = "Incorrect Username or Password";
            incorrectLogin.style.color = "red"
		}
	})
	.catch(error => {
		console.error('login(): ', error);
	});
}

function getPostcodeDB() {
	return fetchPHP('get_postcodeDB.php')
	.then(data => {
		postcodeList = data;
		resetPostcodeDropdown();
		if (window.location.href.includes('dashboard.html')) {
			const searchBoxValue = document.getElementById('search-box').value;
			if (searchBoxValue !== "") {
				searchPostcodes();
			} else {
				displayPostcodes();
			}
		}
	})
	.catch(error => {
		console.error('getPostcodes(): ', error);
	});
}
function resetPostcodeDropdown() {
	clearPostcodes(postcodeDropdown1);
	clearPostcodes(postcodeDropdown2);
	loadPostcodes(postcodeDropdown1);
	loadPostcodes(postcodeDropdown2);
	calculateDistance();
}
function clearPostcodes(postcodeDropdown) {
	if (postcodeDropdown) {
		while (postcodeDropdown.options.length > 0) {
			postcodeDropdown.remove(0);
		}
	}
}
function loadPostcodes(postcodeDropdown) {
	if (postcodeDropdown) {
		postcodeList.forEach(pL => {
			let option = document.createElement('option');
			option.value = pL.postcode;
			option.textContent = pL.postcode;
			postcodeDropdown.appendChild(option);
		});
	}
}

function calculateDistance() {
	if (!postcodeDropdown1 || !postcodeDropdown2) {
		return;
	}
	const selectedPostcode1 = postcodeDropdown1.value;
	const selectedPostcode2 = postcodeDropdown2.value;
	const postcode1 = postcodeList.find(pL => pL.postcode === selectedPostcode1);
	const postcode2 = postcodeList.find(pL => pL.postcode === selectedPostcode2);
	if (postcode1 && postcode2) {
		const distance = haversineDistance(postcode1.latitude, postcode1.longitude, postcode2.latitude, postcode2.longitude);
		const resultBox = document.getElementById('result-box');
		// console.log(resultBox);
		resultBox.textContent = `The distance between ${selectedPostcode1} and ${selectedPostcode2} is ${(distance / 1609.344).toFixed(2)} miles.`;
		resultBox.style.display = 'block';
	} else {
		alert('Please select valid postcodes from the dropdowns.');
	}
}
function haversineDistance(lat1, lon1, lat2, lon2, earthRadius = 6371000/* in meters */) {
	let Δφ = toRadians(lat2 - lat1);
	let Δλ = toRadians(lon2 - lon1);
	let φ = toRadians(lat1);
	let λ = toRadians(lat2);
	let a = (Math.sin(Δφ / 2) * Math.sin(Δφ / 2)) + 
			(Math.cos(φ) * Math.cos(λ) *
			Math.sin(Δλ / 2) * Math.sin(Δλ / 2));
	let distance = earthRadius * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
	return distance;
}
function toRadians(degrees) {
	return degrees * (Math.PI / 180);
}