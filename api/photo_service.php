

<?php

//ini_set('display_errors', '1');  //REMOVE the comment during development
require_once "db_config.php"; //database configuration 

if (isset($_SERVER['HTTP_API_COMMAND'])) {
    $api = $_SERVER['HTTP_API_COMMAND']; //get the API command from the HTTP Header
      
        //Check our API command and route to the appropriate function
        if ($api == 'upload-photo') {
            process_uploaded_photo();
        }
}

function process_uploaded_photo() {

  $data = array(); //object to return as JSON
  $data['success'] = false;
  $data['result']  = null;
  $data['message'] = '';

  $allowedExts = array("jpg", "jpeg", "JPG", "JPEG", "png", "PNG"); // allowed file extensions
  if (isset($_FILES['photofile'])) {
    $uploaded_filename = explode('.', $_FILES["photofile"]["name"]); //seperated file name
    $extension = end($uploaded_filename); //seperated file extension
    $id = $_POST['id'];
    $tablename = $_POST['tablename']; // 'application'
    $fieldname = $_POST['fieldname']; // 'photo'
    $prefix = 'app_photo';
    $uploadsFolder = '/api/uploads/'; // folder to save uploaded files
    if ($_POST['id'] == 0) { // if there is no record ID then return.
      $data['message'] = "ID is required";
      echo json_encode($data);
      die;
    } 
    //Check if a filename exists in the database fieldname ('photo') and delete the photo from the file system before proceeding
    //This way we don't leave any orphaned files wasting our uploads folder space
    $old_filename = find_and_return_filename($id, $tablename, $fieldname);
    if (!empty($old_filename)) {
            delete_photo_file_from_filesystem($old_filename, $uploadsFolder);//delete the old file from the file system because it exists
    }

    if ((($_FILES["photofile"]["type"] == "image/jpeg")
        || ($_FILES["photofile"]["type"] == "image/pjpeg")
        || ($_FILES["photofile"]["type"] == "image/png")
      )
      && ($_FILES["photofile"]["size"] <= 2000000) && in_array($extension, $allowedExts)
    ) {
      if ($_FILES["photofile"]["error"] > 0) {
        $data['message'] = "Return Code: " . $_FILES["photofile"]["error"];
        echo json_encode($data);
        die;
      } else {
        //lets make a new unique filename and save the uploaded file
        $uniquefilename =  save_photo_file_to_filesystem($id, $extension, $uploadsFolder, $prefix); //this function will return the unique filename
        if (!empty($uniquefilename)) {
          update_uploaded_photo_in_database($id, $tablename, $fieldname, $uniquefilename); //to 'uploads' table . Table can be orgchart or applicant
          $data['success'] = true;
          $data['result'] = $uniquefilename; //return the unique filename of the photo to the UI
          $data['message'] = 'File successfully uploaded';
        } else {
          $data['success'] = false;
          $data['result'] = '';
          $data['message'] = 'File uploaded failed';
        }
        echo json_encode($data);
        die;
      }
    } else {
      $data['success'] = false;
      $data['result'] = '';
      $data['message'] = "Invalid file: Either you chose no file or the file type or file size is wrong. Maximum allowable file size is 500KB.  Please go back and try again.";
      echo json_encode($data);
      die;
    }
  }else{
    $data['success'] = false;
    $data['result'] = '';
    $data['message'] = 'File upload failed';
    echo json_encode($data);
    die;
  }
}
//==============================================================

/** 
This function will return the filename of an uploaded photo if it exists in the database table or blank if it doesn't
 */
function find_and_return_filename($id, $tablename, $tablefield){
    require 'db_config.php';
    // Connect to MySQL
    $conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);
    // Check connection
    if ($conn->connect_error) {
        return false;
    }
    // Escape identifiers and values
    $idEscaped = (int)$id; // safe cast to integer

    $sql = "SELECT `$tablefield` FROM `$tablename` WHERE id = $idEscaped";

    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $result = $row[$tablefield];
            try {
                if (empty($result) == false) {
                    return $result;
                } else {
                    return '';
                }
            } catch (Exception $th) {
                $result = '';
            }
        }
    } else {
        return '';
    }
}

function update_uploaded_photo_in_database($id, $tablename, $fieldname, $uniquefilename){
    require 'db_config.php';
    // Connect to MySQL
    $conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);
    // Check connection
    if ($conn->connect_error) {
        return false;
    }
    $filenameEscaped = $conn->real_escape_string($uniquefilename);
    $idEscaped = (int)$id; // cast to integer for safety
    // Build query
    $sql = "UPDATE `$tablename` SET `$fieldname` = '$filenameEscaped' WHERE id = $idEscaped";
    // Execute query
    $result = $conn->query($sql);
    $conn->close();
    if ($result === true) {
        return true;
    } else {
        return false;
    }
}

function delete_photo_info_from_database($id) {

}


/**
Makes a new unique filename and saves the uploaded photo to the file system. Returns the unique filename to the calling function
 */
function save_photo_file_to_filesystem($id, $extension, $uploadsFolder, $prefix){
    $uniqueNo = time();//get the current unix timestamp as our unique number. *You may also generate a UUID here*
    $uniqueFilename = $prefix . "_" . $id . "_" . $uniqueNo . "." . $extension;
    //save to file system
    try {
        move_uploaded_file($_FILES["photofile"]["tmp_name"], dirname(__DIR__) . $uploadsFolder . $uniqueFilename);
    } catch (Exception $exp) {
        return '';
    }
    return $uniqueFilename;
}


/**
Deletes a photo from the file system. Takes the filename and the uploads folder as parameters*/
function delete_photo_file_from_filesystem($filename, $uploadsFolder) {
    $result = false;
    if (empty($filename) == false) {
        //continue if the filename is not empty
        try {
            if (file_exists(dirname(__DIR__)  . $uploadsFolder . $filename)) { //check if the file exists
                $result =  unlink(dirname(__DIR__)  . $uploadsFolder . $filename);// delete the file :- result will be true
            } else {
                $result = false;
            }
        } catch (Exception $th) {
            return false;
        }
    }
    return $result;
}

?> 