<?php

//ini_set('display_errors', '1');  //REMOVE the comment during development
// require_once "db_config.php"; //database configuration 

// if (isset($_POST)) { //check if form has been submitted
//    $formData = array_filter($_POST); // if so, store all key/value pairs in a variable after removing any empty fields
//    // $formData = $_POST; // if so, store all key/value pairs in a variable
//     $keys = array_keys($formData); //get all the keys(field names) into an array
   

//     // Connect to MySQL
//     $conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName); // Using mysqli here
   
    
//     // Check connection
//     if ($conn->connect_error) {
//         echo "Connection failed: " . $conn->connect_error;
//         die; //There is no point in continuing if connection fails. QUIT !
//     }
    
//     $all_fieldnames =  implode(",", $keys); //from the submitted form, create a comma separated string of field names
//     $all_values = ''; // all our incoming values will enter here
//     foreach ($keys as $key) { //get all corresponding values to the fieldnames. Use a loop
//     //if $formData[$key] is a string, wrap it in single quotes
//     //if not a string, leave it alone
//         if (is_string($formData[$key])) {
//             $all_values .= "'" . $conn->real_escape_string($formData[$key]) . "',"; //escape special characters for security
//         }    
//         else{
//             $all_values .= $formData[$key] . ","; //add comma after each value
//         }
//     }
//     $all_values = substr($all_values, 0, -1); //When the loop is done,remove the last comma after the last value
  
//     $tablename = 'application';
   
//     $insertQuery = "INSERT INTO `$tablename` ($all_fieldnames) VALUES ($all_values)";
//     //Our insert query will now look like: INSERT INTO `application` (lastName, firstName, address, ...) VALUES ('nworji', 'mike', 'ama computer rd', ...);

//     $result = $conn->query($insertQuery);//run the query on the database
//      // Close connection
     
//     $response = array();//prepare a response
//     if ($result) {
//     $last_id = $conn->insert_id; //get the id of the last inserted record
//     $response['result'] = $last_id; //return the id to the UI
//     $response['success'] = true;
//     $response['message'] = "Application submitted successfully";
//     } else {
//     $response['result'] = 0; //no record was inserted
//     $response['success'] = false;
//     $response['message'] = "Application submission failed : " . $conn->error;
//     }
//     // Close connection
//     $conn->close();

//     echo json_encode($response); //return the response object
//     die;

// }

?>