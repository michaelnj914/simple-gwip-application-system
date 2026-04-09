<?php

ini_set('display_errors', '1');  //REMOVE the comment during development
if (isset($_SERVER['HTTP_API_COMMAND'])) {
    $api = $_SERVER['HTTP_API_COMMAND']; //get the API command

    //Check our API command and route to the appropriate functions
    if ($api == 'create-application') {
        create_application();
    }

    if ($api == 'get-application-list') {
        get_application_list();
    }

    if ($api == 'get-one-application') {
        if (isset($_POST['id'])) { //application id. Needed for the get_one_application function
            $applyID =  $_POST['id'];
            get_one_application($applyID);
        }
    }

    if ($api == 'delete-application') {
        if (isset($_POST['id'])) { //data sent from the front end must have the ID of the record present
            $applyID =  $_POST['id'];
            delete_application($applyID);
        }
    }
}

function create_application()
{
    if (isset($_POST)) { //check if form has been submitted

        require_once "db_config.php"; //database configuration 
        // Connect to MySQL
        $conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName); // Using mysqli here

        // Check connection
        if ($conn->connect_error) {
            //return error to front end
            $response = array();
            $response['success'] = false;
            $response['result'] = null;
            $response['message'] = "Connection failed: " . $conn->connect_error;
            echo json_encode($response);
            die; //There is no point in continuing if connection fails. QUIT !
        }

        $formData = array_filter($_POST); // Get all key/value pairs in a variable and remove empty values
        $keys = array_keys($formData); //get all the keys(field names) into an array
        $all_fieldnames =  implode(",", $keys); //from the submitted form, create a comma separated string of field names
        $all_values = ''; // all our incoming values will enter here
        foreach ($keys as $key) { //get all corresponding values to the fieldnames. Use a loop
            //if $formData[$key] is a string, wrap it in single quotes
            //if not a string, leave it alone
            if (is_string($formData[$key])) {
                $all_values .= "'" . $conn->real_escape_string($formData[$key]) . "',"; //escape special characters for security
            } else {
                $all_values .= $formData[$key] . ","; //add comma after each value
            }
        }
        $all_values = substr($all_values, 0, -1); //When the loop is done,remove the last comma after the last value

        $tablename = 'application';

        $insertQuery = "INSERT INTO `$tablename` ($all_fieldnames) VALUES ($all_values)";
        //Our insert query will now look like: INSERT INTO `application` (lastName, firstName, address, ...) VALUES ('nworji', 'mike', 'ama computer rd', ...);

        $result = $conn->query($insertQuery); //run the query on the database

        $response = array(); //prepare a response
        if ($result) {
            $last_id = $conn->insert_id; //get the id of the last inserted record
            $response['result'] = $last_id; //return the id to the UI
            $response['success'] = true;
            $response['message'] = "Application submitted successfully";
        } else {
            $response['result'] = 0; //no record was inserted
            $response['success'] = false;
            $response['message'] = "Application submission failed : " . $conn->error;
        }
        // Close connection
        $conn->close();

        echo json_encode($response); //return the response object
        die;
    }
}

function get_application_list()
{
    require_once "db_config.php"; //database configuration 
    // Connect to MySQL
    $conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName); // Using mysqli here
    $response = array();
    // Check connection
    if ($conn->connect_error) {
        //return error to front end
        $response['success'] = false;
        $response['result'] = null;
        $response['message'] = "Connection failed: " . $conn->connect_error;
        echo json_encode($response);
        die; // connection fails. QUIT !
    }

    $tablename = 'application';

    $sql = "SELECT id, photo, firstName, lastName, applyFor, birthdate FROM $tablename";
    $db_result = $conn->query($sql);
    // Close connection
    $conn->close();
    if ($db_result->num_rows > 0) {

        $rows = $db_result->fetch_all(MYSQLI_ASSOC); // fetch all rows from the database

        $response['result'] = $rows; //return the list
        $response['success'] = true;
        $response['message'] = "Application list retrieved successfully";
    } else {
        $response['result'] = 0; //no record was retrieved
        $response['success'] = false;
        $response['message'] = "Applications retrieval failed";
    }
    echo json_encode($response); //return the response object
    die;
}


function delete_application($applyID)
{
    require_once "db_config.php"; //database configuration 
    require_once "photo_service.php"; //we will use a function from this file to remove photos
    // Connect to MySQL
    $conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName); // Using mysqli here
    $response = array();
    // Check connection
    if ($conn->connect_error) {
        //return error to front end
        $response['success'] = false;
        $response['result'] = null;
        $response['message'] = "Connection failed: " . $conn->connect_error;
        echo json_encode($response);
        die; // connection fails. QUIT !
    }
    $tablename = 'application';
    //check if a photo is recorded for this application
    $photo = find_and_return_filename($applyID, $tablename, 'photo'); // Use a function from photo_service.php
    if (empty($photo) == false) {
        //delete the photo if it exists
        delete_photo_file_from_filesystem($photo, '/api/uploads/'); // Use another function from photo_service.php
    }
    //go ahead and delete the application
    $sql = "DELETE FROM $tablename WHERE id = $applyID";
    $result = $conn->query($sql);
    // Close connection
    $conn->close();
    if ($result) {
        $response['result'] = $applyID;
        $response['success'] = true;
        $response['message'] = "Application deleted successfully";
    } else {
        $response['result'] = 0;
        $response['success'] = false;
        $response['message'] = "Application deletion failed";
    }
    echo json_encode($response); //return the response object
    die;
}

function get_one_application($applyID)
{

    require_once "db_config.php"; //database configuration 
    // Connect to MySQL
    $conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName); // Using mysqli here
    $response = array();
    // Check connection
    if ($conn->connect_error) {
        //return error to front end
        $response['success'] = false;
        $response['result'] = null;
        $response['message'] = "Connection failed: " . $conn->connect_error;
        echo json_encode($response);
        die; // connection fails. QUIT !
    }
    $tablename = 'application';

    $qry = "SELECT * FROM $tablename WHERE id = $applyID"; // select all columns from the table
    $db_result = $conn->query($qry);
    // Close connection
    $conn->close();
    if ($db_result->num_rows > 0) {
        $row = $db_result->fetch_assoc(); // fetch one row from the database
        $response['result'] = $row; //return the row
        $response['success'] = true;
        $response['message'] = "Application retrieved successfully";
    } else {
        $response['result'] = null; //no record was retrieved
        $response['success'] = false;
        $response['message'] = "Application retrieval failed";
    }
    echo json_encode($response); //return the response object
    die;
}
