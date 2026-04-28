
<?php
//ini_set('display_errors', '1');  //REMOVE the comment during development
// Start or resume session to store user data
session_start();

// ini_set('display_errors', '1');  //REMOVE the comment during development
if (isset($_SERVER['HTTP_API_COMMAND'])) {
    $api = $_SERVER['HTTP_API_COMMAND']; //get the API command

    // Check if the API command sent from the frontend is "login"
    if ($api == 'login') {
        // Call the login function to authenticate the user
        login();
        // Stop further execution so other protected routes are not checked
        exit();
    }
    // If the API command is "logout"
    if ($api == 'logout') {
        // Call the logout function to destroy the session
        logout();
        // Stop script execution after logout
        exit();
    }
    // Get all users
    if ($api == 'get-users') {
        // Call the get_users function
        get_users();
       
    }
    //Delete a user
    if ($api == 'delete-user') {
    if (isset($_POST['id'])) { //data sent from the front end must have the ID of the record present
            $userID = intval($_POST['id']); //convert to integer
            delete_user($userID);
        }       
       
    }
}

//get all users =================================
if ($api == 'get-users') {
    // Call the get_users function
    get_users();
    exit();
}
//======================================================
function login()
{
    // Load database connection settings (host, user, password, database name)
    require_once "db_config.php";

    // Tell the browser we are returning JSON response (API format)
    header("Content-Type: application/json");

    // Create connection to MySQL database
    $conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);

    // Check if database connection failed
    if ($conn->connect_error) {
        // Stop execution and return error message in JSON format
        exit(json_encode(["success" => false, "message" => "Connection failed"]));
    }
    // Start session to store logged-in user information
    session_start();
    try {
        $username = '';
        $password = '';
        // Get username from POST request
        if (isset($_POST['username'])) $username =   $_POST['username'];
        // Get password from POST request (or empty string if not sent)
        if (isset($_POST['password'])) $password =  $_POST['password'];

        // Prepare SQL statement to find user with matching username
        // LIMIT 1 ensures only one record is returned
        $stmt = $conn->prepare("SELECT id, username, password, role, logins, firstname, lastname FROM admin WHERE username = ? LIMIT 1");

        // Check if SQL preparation failed
        if (!$stmt) {
            // Stop execution and return error message
            exit(json_encode(["success" => false, "message" => "Query failed"]));
        }
        // Bind the username parameter to the SQL query
        // "s" means string type
        $stmt->bind_param("s", $username);

        // Execute the SQL query    
        $stmt->execute();
        $db_password = '';
        $salt = $password_salt; // from db_config.php
        // Store results into variables:
        // $id = user ID
        // $db_username = username from database
        // $db_password = hashed password from database
        //$logins = number of times this user has logged in
        // $role = 1 for admin, 2 for manager, 3 for staff (Designation in the organization)
        // $firstname, $lastname; other user details

        $stmt->bind_result($id, $db_username, $db_password, $role, $logins, $firstname, $lastname);

        // Fetch the record and verify password
        // password_verify() compares plain password with hashed password
        if ($stmt->fetch() && password_verify($password . $salt, $db_password)) {

            // Store username in session after successful login 
            $_SESSION['admin'] = $db_username;
            //Craete an array to store logged in user details
            $logged_in_user = array();
            $logged_in_user['id'] = $id;
            $logged_in_user['username'] = $db_username;
            $logged_in_user['role'] = $role;
            $logged_in_user['firstname'] = $firstname;
            $logged_in_user['lastname'] = $lastname;

            $_SESSION['logged_in_user'] = $logged_in_user; // push the logged in user into the session 
        
$stmt->close();
            //update the database table with the current date and increase the login number
            $logins = $logins + 1;
            $sql = "UPDATE admin SET logins = $logins, lastlogin = NOW() WHERE username = '$username'";
            $conn->query($sql);
            // Return success response
            $res = ["success" => true, "message" => "Login successful", "result" => $logged_in_user];
             
              // $conn->close();
        } else {
            // Return error response if login fails
            $res = ["success" => false, "message" => "Invalid username or password"];
        }
        // Close prepared statement to free resources
       // $stmt->close();
        // Close database connection
        $conn->close();
        exit(json_encode($res));
    } catch (Exception $th) {
        // Return error response if exception occurs
        $res = ["success" => false, "message" => $th->getMessage()];
        // Return response as JSON and stop script execution
        exit(json_encode($res));
    }
}


function logout()
{
    session_start(); // ensure session is active
    // Destroy the session
    session_destroy();
    exit(json_encode([
        "success" => true,
        "message" => "Logged out successfully"
    ]));
}

//Create User ===============================
function create_user()
{
    // Load database connection settings (host, user, password, database name)
    require_once "db_config.php";

    // Connect to MySQL
    $conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName); // Using mysqli here

    // Check connection
    if ($conn->connect_error) {
        //return error to front end
        exit(json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]));
    }
    //our salt for password hashing
    $salt = $password_salt; // from db_config

    // Get username from POST request
    if (isset($_POST['username'])) $username = $_POST['username'];
    // Get password from POST request (or empty string if not sent)
    if (isset($_POST['password'])) $password = $_POST['password'];
    // Get role from POST request (or zero if not sent)
    if (isset($_POST['role'])) {
        $role = $_POST['role'];
    } else {
        $role = 0;
    }
    // Get firstname from POST request (or empty string if not sent)
    if (isset($_POST['firstname'])) $firstname = $_POST['firstname'];
    // Get lastname from POST request (or empty string if not sent)
    if (isset($_POST['lastname'])) $lastname = $_POST['lastname'];

    $lastlogin = date('Y-m-d'); //get current date
    //hash the plain-text password
    $hashed_password = password_hash($password . $salt, PASSWORD_DEFAULT);
    // Prepare SQL statement
    $sql = "INSERT INTO admin (username, password, role, firstname, lastname, logins, lastlogin) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    // Bind parameters
    $stmt->bind_param("ssissis", $username, $hashed_password, $role, $firstname, $lastname, 0, $lastlogin);
    // Execute statement
    if ($stmt->execute()) {
        // If successfully added, call get_users() to refresh the user list
        get_users();
    } else {
        // Return error response
        exit(json_encode(["success" => false, "message" => "Error creating user: " . $conn->error]));
    }
}
//Get Users
function get_users()
{
    // Load database connection settings (host, user, password, database name)
    require_once "db_config.php";

    // Connect to MySQL
    $conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName); // Using mysqli here

    // Check connection
    if ($conn->connect_error) {
        //return error to front end
        exit(json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]));
    }

    // Prepare SQL statement
    $sql = "SELECT id, username, role, firstname, lastname, lastlogin, logins FROM admin";
    $result = $conn->query($sql);

    // Check if query was successful
    if ($result->num_rows > 0) {
        // Convert result to array
        $users = $result->fetch_all(MYSQLI_ASSOC);
        // Return success response
        exit(json_encode(["success" => true, "message" => "Users retrieved successfully", "result" => $users]));
    } else {
        // Return error response
        exit(json_encode(["success" => false, "message" => "No users found"]));
    }
}

function delete_user($id)
{
    // Load database connection settings (host, user, password, database name)
    require_once "db_config.php";

    // Connect to MySQL
    $conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName); // Using mysqli here

    // Check connection
    if ($conn->connect_error) {
        //return error to front end
        exit(json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]));
    }    
    // Prepare SQL statement
    $sql = "DELETE FROM admin WHERE id = ?";
    $stmt = $conn->prepare($sql);
    // Bind parameters
    $stmt->bind_param("i", $id);
    // Execute statement
    if ($stmt->execute()) {
        // If successfully deleted, call get_users() to refresh the user list
        get_users();
    } else {
        // Return error response
        exit(json_encode(["success" => false, "message" => "Error deleting user: " . $conn->error]));
    }
}

