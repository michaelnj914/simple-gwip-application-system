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
        get_one_application();
    }

    if ($api == 'delete-application') {
        delete_application();
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

function get_application_list() {}

function get_one_application() {}

function delete_application() {}   

