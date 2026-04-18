<?php 
session_start();
if(isset($_SESSION['current_user'])) {

}
else {
  header("location:"."/healthcare-project/login.php");
  die();
}
?>



<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Admin Panel</title>
    <link rel="stylesheet" href="./assets/css/dashboard.css" />
  </head>
  <body>
    
    <div class="dashboard-wrapper">
      <!-- Dashboard -->
     <div id="adminSection" class="dashboard-box">
        <h1>GOD'S WILL INTERNATIONAL PLACEMENT, INC</h1>
        <p class="subtitle">Medical Professionals Application Form</p>

        <div class="top-bar">
          <h2>Applications Dashboard</h2>
          <button id="btnLogout">Logout</button>
          
        </div>

        <input type="text" id="searchName" placeholder="Search by Name" />
        <input
          type="text"
          id="filterJob"
          placeholder="Filter by Job Category"
        />

        <table>
          <thead>
            <tr>
              <th>Date Applied</th>
              <th>Name</th>
              <th>Age</th>
              <th>Job Category</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="tableBody"></tbody>
        </table>
      </div>

     
    </div>

    <script src="./assets/js/jquery.js"></script>
    <script src="./assets/js/logout.js"></script>
    <!-- <script src="./assets/js/login.js"></script> -->
  </body>
</html>
