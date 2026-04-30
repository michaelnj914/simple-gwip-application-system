<?php

require_once "api/db_config.php";

$conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$username = "admin";
$password = "1234";
$role = 1;
$firstname = "Admin";
$lastname = "User"; 
$logins = 0;
$lastlogin = date('Y-m-d');

$salt= $password_salt; // from db_config.php
$hashedPassword = password_hash($password . $salt, PASSWORD_DEFAULT);
try {
    $stmt = $conn->prepare("INSERT INTO admin (username, password, role, firstname, lastname, lastlogin, logins ) VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssisssi", $username, $hashedPassword, $role, $firstname, $lastname, $lastlogin, $logins);
$stmt->execute();
echo "Admin inserted with hashed password";
} catch (Exception $th) {
    echo "Error: " . $th->getMessage();
}



?>