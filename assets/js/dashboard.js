//@ts-check-ignore
//Global variable to hold data array from the database
let dataArray = [];
let usersDataArray = [];

window.addEventListener("load", async function () {
  // Don't show our read-only form on this page that is used to display the details of one application
  document.getElementById('printable-application').style.display = 'none';

  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  if (!loggedInUser) {
    // No user is logged in, redirect to login page
    window.location.href = 'index.html';
  }
  //Display the logged in user
  document.getElementById('userFirstName').textContent = loggedInUser.firstname;
  document.getElementById('userLastName').textContent = loggedInUser.lastname;
  document.getElementById('designation').textContent = getDesignationFromCode(+loggedInUser.role);

  //Make sure our dashboard view is shown
  document.querySelector(".dashboard-wrapper").style.display = "block";
  //show the ManageUsers button if the user is an admin
  if (loggedInUser.role === 1) {
    document.getElementById('manageUsersButton').style.display = 'block';
  }
  await getApplicationList(); //get the list of applications after the page has loaded   
});

//========================================================
//USER-MANAGEMENT BEGINS ========================================
//========================================================

/**
 * Converts the permissions code to a readable string
 * @param {*} code 
 * @returns 
 */
function getDesignationFromCode(code) {
  if (code === 1) {
    return 'ADMIN';
  } else if (code === 2) {
    return 'MANAGER';
  } else if (code === 3) {
    return 'STAFF';
  } else {
    return '-';
  }
}

function openUserEncoding() {
  //User form is in a dialog
  document.getElementById('users-dialog').showModal();
  //load users
  getUsersList();

}

async function createUser() {
  const userFrm = document.getElementById("user-form");
  const formData = new FormData(userFrm);
  const myHeaders = {
    'api-command': 'create-user'
  };
  const response = await fetch('api/users_service.php', { method: 'POST', body: formData, headers: myHeaders });
  const data = await response.json();

  if (data.success) {
    getUsersList();
    //clear the form
    userFrm.reset();
  }
}


function closeUserdialog() {
  //reset the user form if it has any entries
  const userFrm = document.getElementById("user-form");
   userFrm.reset();// clear any entries
  //close the dialog
  document.getElementById('users-dialog').close();  
}

async function getUsersList() {
  const myHeaders = {
    'api-command': 'get-users'
  };
  const response = await fetch('api/users_service.php', { method: 'POST', headers: myHeaders });
  const data = await response.json();
  usersDataArray = data.result;//put data into global variable that holds the list of applications
  renderUsersTable(data.result);//also render it out
  return true; //return true after the table has been built
}

function renderUsersTable(users) {
  const usersTableBody = document.getElementById('users-table-body');
  let tbody = '';
  if (users.length === 0) { // if an empty array was passed in, render a message and return
    tbody = '<tr><td colspan="7" style="text-align: center;font-size:1.2rem;color:red;">No Users Found</td></tr>';
    usersTableBody.innerHTML = tbody;
    return false;
  }
  //Use a loop to build up table rows out of the returned data
  users.forEach((item) => {
    tbody += '<tr  onclick="getOneUser(' + item.id + ', event)" >' +
      '<td>' + (+users.indexOf(item) + 1) + '</td>' +
      '<td>' + item.username + '</td>' +
      '<td style="text-align: left;">' + item.firstname + ' ' + item.lastname.toUpperCase() + '</td>' +
      '<td>' + getDesignationFromCode(+item.role) + '</td>' + // get designation
      '<td>' + (item.lastlogin ? item.lastlogin.split('-')[1] + '/' + item.lastlogin.split('-')[2] + '/' + item.lastlogin.split('-')[0] : 'N/A') + '</td>' +   // Format filedate from YYYY-MM-DD to MM/DD/YYYY
      '<td style="text-align: left;">' + item.logins + '</td>' +
      '<td><button type="button" class="delete-button" style="border-radius: 50%;width:24px;height:23px;padding:0;" title="Delete This User" onclick="deleteUser(' + item.id + ')">X</button></td>' +
      '</tr>';
  });
  // after the loop:
  usersTableBody.innerHTML = tbody; //insert the data into the users table
  return true;
}

async function deleteUser(userId) {
  if (confirm('Are you sure you want to delete this user?') === false) { return; }  
  const myHeaders = {
    'api-command': 'delete-user'
  };
  const formData = new FormData();
  formData.append('id', userId);
  const response = await fetch('api/users_service.php', { method: 'POST', headers: myHeaders, body: formData });
  const data = await response.json();
  if (data.success) {
    getUsersList(); //reload the users
  }
}
//===========================================================
// END USER-MANAGEMENT ========================================
//========================================================

async function getApplicationList() {
  const myHeaders = {
    'api-command': 'get-application-list'
  }
  const response = await fetch('api/application_service.php', { method: 'POST', headers: myHeaders });
  const data = await response.json();

  if (!data.success) {
    return false; //No applications exists in the database
  }
  dataArray = data.result;//put data into global variable that holds the list of applications
  renderTable(data.result);//also render it out
  return true; //return true after the table has been built
}

/**
 * Search for applications by applicant's name. Will search by first name or last name
 * @param {*} event 
 * @returns true if data is found, false if not
 */
function searchByName(event) {
  const searchString = event.target.value; //extract our search string from the event
  if (searchString === '') { //if the search string is empty
    renderTable(dataArray);// render the full list
    return false; //quit
  }
  //filter the list of applications by the incoming value. We will search by first name and last name
  //return any item where lastname or firstname contains the search string
  const filteredList = dataArray.filter(item => item.firstName.toLowerCase().includes(searchString.toLowerCase())
    || item.lastName.toLowerCase().includes(searchString.toLowerCase()));

  if (filteredList.length > 0) {
    //something was found
    renderTable(filteredList); //render the result into the table
    return true;
  } else {
    //render empty array
    renderTable([]);
    return false;
  }
}

/**
 * This function will search for applications by job category. If  the database job category starts with the search string
 * @param {*} event onKeyUp event, the search string has been entered
 * @returns true if data is found, false if not
 */
function searchByJobCategory(event) {
  const searchString = event.target.value; //extract our search string
  if (searchString === '') { //if the search string is empty
    renderTable(dataArray);// render the full list
    return false; //quit
  }
  //filter the list of applications by the incoming value. We will search by job_category
  //return any item where job_category begins with the search string
  const filteredList = dataArray.filter(item => item.applyFor.toLowerCase().startsWith(searchString.toLowerCase()));

  if (filteredList.length > 0) {
    //something was found
    renderTable(filteredList); //render the result into the table
    return true;
  } else {
    //render an empty array
    renderTable([]);
    return false;
  }
}

/**
 * It renders a list of applications as a collection of table rows. It attaches these rows to the table body
 * @param {*} dataArray Passed in from an array of applications
 * @returns true if rendered successfully or false if not
 */
function renderTable(dataArray) {
  const tableBody = document.getElementById('table-body');
  //get permission level
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const permissionLevel = loggedInUser.role; //admin, staff or manager
  let tbody = '';
  if (dataArray.length === 0) { // if an empty array was passed in, render a message and return
    tbody = '<tr><td colspan="7" style="text-align: center;font-size:1.2rem;color:red;">No applications found</td></tr>';
    tableBody.innerHTML = tbody;
    return false;
  }
  //Use a loop to build up table rows out of the returned data
  dataArray.forEach((item) => {
    let photoURL = 'api/uploads/';
    let photoObj = ''; //prepare for each photo
    if (item.photo === null) {
      photoObj = '-'; //No photo
    } else {
      photoObj = '<img src=' + photoURL + item.photo + ' style="height: 50px;"  />'; //display the photo
    }

    tbody += '<tr class="apply-table-row" onclick="getOneApplication(' + item.id + ', event)" >' +
      '<td>' + (+dataArray.indexOf(item) + 1) + '</td>' +
      '<td>' + photoObj + '</td>' +
      '<td>' + (item.filedate ? item.filedate.split('-')[1] + '/' + item.filedate.split('-')[2] + '/' + item.filedate.split('-')[0] : 'N/A') + '</td>' +   // Format filedate from YYYY-MM-DD to MM/DD/YYYY
      // '<td>' + (item.filedate  ? new Date(item.filedate).toLocaleDateString('en-US') : 'N/A') + '</td>' +
      '<td style="text-align: left;"><b>' + item.lastName.toUpperCase() + '</b>, ' + item.firstName + '</td>' +
      '<td>' + computeAgeFromDate(item.birthdate) + '</td>' + //will compute the age from the date of birth
      '<td style="text-align: left;">' + item.applyFor + '</td>';
      if(permissionLevel === 1) { //if admin render a delete button
       tbody += '<td><button class="delete-button" title="Delete Application" onclick="deleteApplication(' + item.id + ')">-- delete --</button></td>' + '</tr>';
      } else {//else render empty column
       tbody +=  '<td></td>' + '</tr>';
      }
      
  });
  // after the loop:
  tableBody.innerHTML = tbody; //insert the data into the table
  return true; //return true after the table has been built
}


//==================================================================
/**
 * This function will delete an application
 * @param {*} applyId 
 */
async function deleteApplication(applyId) {
  //first confirm the deletion
  if (confirm('Are you sure you want to delete this application?') === false) {
    return false; //user cancelled
  }
  // prepare to make the request to the server
  const myHeaders = {
    'api-command': 'delete-application'
  };
  const formData = new FormData();
  formData.append('id', applyId);
  try {
    // make the request
    const response = await fetch('api/application_service.php', { method: 'POST', headers: myHeaders, body: formData });
    const data = await response.json();
    if (data.success) { //if the application was deleted successfully
      //reload the application list
      await getApplicationList();
    }
  } catch (error) {
    console.log('Error occured while deleting application: ', error);
  }
}

/**
 * This function will compute the age from the date of birth
 * @param {*} dateString as the date of birth
 * @returns age as a numeral
 */
function computeAgeFromDate(dateString) {
  var today = new Date();
  var birthDate = new Date(dateString);
  var age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Get one application from the database using the primary key (id).
 This is called when the user clicks on the table row. We are using Client-side rendering, 
 which means a form is rendered in the browser using JavaScript when we download the data. 
 We have a hidden application form that is shown when we retrieve the details of one application
 * @param {*} applyId 
 */
async function getOneApplication(applyId, event) {
  event.preventDefault();
  if (event.target.tagName === 'BUTTON') { //if the user clicked on the delete button. We don't want to do anything here
    return false;
  }
  // prepare to make the request to the server
  const myHeaders = {
    'api-command': 'get-one-application'
  };
  const formData = new FormData();
  formData.append('id', applyId);
  try {
    loadingDialog = document.getElementById('loading-dialog');
    loadingDialog.showModal();
    // make the request
    const response = await fetch('api/application_service.php', { method: 'POST', headers: myHeaders, body: formData });
    const data = await response.json();
    if (data.success) { // If the application was retrieved successfully
      loadingDialog.close();
      // hide our current dashboard
      document.querySelector(".dashboard-wrapper").style.display = "none";
      // Show the hidden application form
      document.getElementById("printable-application").style.display = "block";
      populateForm(data.result);//populate the form with the returned data
      //scroll to the top of the page
      window.scrollTo(0, 0);
    }
  } catch (error) {
    console.log('Error occured while obtaining application: ', error);
    alert("Something went wrong!" + error);
  }
}

/**
 * As we return the data from our server as JSON, we need to check if the data is defined or null
 * @param {*} obj  object
 * @returns empty string if object is not defined or null else it returns the object
 */
function validateDisplayedData(obj) {
  if (obj !== undefined && obj !== null) {
    return obj;
  } else {
    return '';
  }
}

function goBack() {
  // Make the html of the application list dashboard visible
  document.querySelector(".dashboard-wrapper").style.display = "block";
  // Hide the one application with retrieved data
  document.getElementById("printable-application").style.display = "none";
}

printApplication = () => {
  window.print();
}

/**
 * Populate a form with the details of one application from a database
 * @param {*} dataRow contains all data for one application
 * @returns a boolean. True if no errors occur or False otherwise
 */
function populateForm(dataRow) {
  let photoFolder = 'api/uploads/';
  //disable all inputs, selects and textareas
  const formElements = document.querySelectorAll('#printable-application input, #printable-application select, #printable-application textarea, #printable-application checkbox, #printable-application radio');

  // Loop through each element and make read-only, disabled and apply some css properties
  formElements.forEach(element => {
    // element.value = '';
    element.readOnly = true;
    //  element.disabled = true;
    //style the elements
    element.style.color = 'blue';
    element.style.fontWeight = 'bold';
    element.style.fontSize = '1rem';
  });
  try {
    let photoObj = ""; //prepare for photo
    if (dataRow.photo === null) {
      photoObj = "-"; //No photo
    } else {
      photoObj =
        "<img src=" +
        photoFolder +
        dataRow.photo +
        ' style="width: 185px;margin:0 auto;"  />'; //display the photo
    }
    document.querySelector("input[name='applyFor']").value = validateDisplayedData(dataRow.applyFor).toUpperCase();
    document.getElementById("two-by-two").innerHTML = photoObj; //display the photo by injecting into the page
    document.querySelector("input[name='firstName']").value =
      validateDisplayedData(dataRow.firstName).toUpperCase();
    document.querySelector("input[name='lastName']").value =
      validateDisplayedData(dataRow.lastName).toUpperCase();
    document.querySelector("input[name='middleName']").value =
      validateDisplayedData(dataRow.middleName).toUpperCase();
    document.querySelector("input[name='email']").value =
      validateDisplayedData(dataRow.email);

    document.querySelector("input[name='first_choice']").value =
      validateDisplayedData(dataRow.first_choice).toUpperCase();
    document.querySelector("input[name='second_choice']").value =
      validateDisplayedData(dataRow.second_choice).toUpperCase();
    document.querySelector("input[name='third_choice']").value =
      validateDisplayedData(dataRow.third_choice).toUpperCase();

    document.querySelector("input[name='chk_directhire']").checked =
      +validateDisplayedData(dataRow.chk_directhire); //checkbox
    document.querySelector("input[name='chk_indirecthire']").checked =
      +validateDisplayedData(dataRow.chk_indirecthire); //checkbox
    document.querySelector("input[name='chk_gwiphire']").checked =
      +validateDisplayedData(dataRow.chk_gwiphire); //checkbox

    document.querySelector("input[name='birthdate']").value =
      validateDisplayedData(dataRow.birthdate).substring(0, 10);

    document.querySelector("input[name='filedate']").value =
      validateDisplayedData(dataRow.filedate).substring(0, 10);


    document.querySelector("input[name='phone']").value =
      validateDisplayedData(dataRow.phone);
    document.querySelector("select[name='civilStatus']").value =
      validateDisplayedData(dataRow.civilStatus); //select field
    document.querySelector("select[name='gender']").value =
      validateDisplayedData(dataRow.gender); //select field
    document.querySelector("input[name='address']").value =
      validateDisplayedData(dataRow.address);
    document.querySelector("input[name='alternateAddress']").value =
      validateDisplayedData(dataRow.alternateAddress);

    document.querySelector("input[name='height']").value =
      validateDisplayedData(dataRow.height);
    document.querySelector("input[name='weight']").value =
      validateDisplayedData(dataRow.weight);
    document.querySelector("input[name='religion']").value =
      validateDisplayedData(dataRow.religion);
    document.querySelector("input[name='highestEducational']").value =
      validateDisplayedData(dataRow.highestEducational);
    document.querySelector("input[name='courseTaken']").value =
      validateDisplayedData(dataRow.courseTaken);
    document.querySelector("input[name='experience']").value =
      validateDisplayedData(dataRow.experience);
    document.querySelector("input[name='hobbies']").value =
      validateDisplayedData(dataRow.hobbies);

    // ===============================
    // UNIVERSITY
    // ===============================
    document.querySelector("input[name='university_name']").value =
      validateDisplayedData(dataRow.university_name);

    document.querySelector("input[name='university_location']").value =
      validateDisplayedData(dataRow.university_location);

    document.querySelector("input[name='university_year']").value =
      validateDisplayedData(dataRow.university_year);

    document.querySelector("input[name='university_course']").value =
      validateDisplayedData(dataRow.university_course);

    // ===============================
    // COLLEGE
    // ===============================
    document.querySelector("input[name='college_name']").value =
      validateDisplayedData(dataRow.college_name);

    document.querySelector("input[name='college_location']").value =
      validateDisplayedData(dataRow.college_location);

    document.querySelector("input[name='college_year']").value =
      validateDisplayedData(dataRow.college_year);

    document.querySelector("input[name='college_course']").value =
      validateDisplayedData(dataRow.college_course);

    // ===============================
    // HIGH SCHOOL
    // ===============================
    document.querySelector("input[name='highschool_name']").value =
      validateDisplayedData(dataRow.highschool_name);

    document.querySelector("input[name='highschool_location']").value =
      validateDisplayedData(dataRow.highschool_location);

    document.querySelector("input[name='highschool_year']").value =
      validateDisplayedData(dataRow.highschool_year);

    document.querySelector("input[name='highschool_course']").value =
      validateDisplayedData(dataRow.highschool_course);

    // ===============================
    // ELEMENTARY
    // ===============================
    document.querySelector("input[name='elementary_name']").value =
      validateDisplayedData(dataRow.elementary_name);

    document.querySelector("input[name='elementary_location']").value =
      validateDisplayedData(dataRow.elementary_location);

    document.querySelector("input[name='elementary_year']").value =
      validateDisplayedData(dataRow.elementary_year);

    document.querySelector("input[name='elementary_course']").value =
      validateDisplayedData(dataRow.elementary_course);

    // ===============================
    // TECHNICAL SCHOOL
    // ===============================
    document.querySelector("input[name='technical_name']").value =
      validateDisplayedData(dataRow.technical_name);

    document.querySelector("input[name='technical_training']").value =
      validateDisplayedData(dataRow.technical_training);

    document.querySelector("input[name='technical_year']").value =
      validateDisplayedData(dataRow.technical_year);

    document.querySelector("input[name='technical_course']").value =
      validateDisplayedData(dataRow.technical_course);

    // ===============================
    // UNIVERSITY
    // ===============================
    document.querySelector("input[name='university_name']").value =
      validateDisplayedData(dataRow.university_name);

    document.querySelector("input[name='university_location']").value =
      validateDisplayedData(dataRow.university_location);

    document.querySelector("input[name='university_year']").value =
      validateDisplayedData(dataRow.university_year);

    document.querySelector("input[name='university_course']").value =
      validateDisplayedData(dataRow.university_course);

    // ===============================
    // COLLEGE
    // ===============================
    document.querySelector("input[name='college_name']").value =
      validateDisplayedData(dataRow.college_name);

    document.querySelector("input[name='college_location']").value =
      validateDisplayedData(dataRow.college_location);

    document.querySelector("input[name='college_year']").value =
      validateDisplayedData(dataRow.college_year);

    document.querySelector("input[name='college_course']").value =
      validateDisplayedData(dataRow.college_course);

    // ===============================
    // HIGH SCHOOL
    // ===============================
    document.querySelector("input[name='highschool_name']").value =
      validateDisplayedData(dataRow.highschool_name);

    document.querySelector("input[name='highschool_location']").value =
      validateDisplayedData(dataRow.highschool_location);

    document.querySelector("input[name='highschool_year']").value =
      validateDisplayedData(dataRow.highschool_year);

    document.querySelector("input[name='highschool_course']").value =
      validateDisplayedData(dataRow.highschool_course);

    // ===============================
    // ELEMENTARY
    // ===============================
    document.querySelector("input[name='elementary_name']").value =
      validateDisplayedData(dataRow.elementary_name);

    document.querySelector("input[name='elementary_location']").value =
      validateDisplayedData(dataRow.elementary_location);

    document.querySelector("input[name='elementary_year']").value =
      validateDisplayedData(dataRow.elementary_year);

    document.querySelector("input[name='elementary_course']").value =
      validateDisplayedData(dataRow.elementary_course);

    // ===============================
    // TECHNICAL
    // ===============================
    document.querySelector("input[name='technical_name']").value =
      validateDisplayedData(dataRow.technical_name);

    document.querySelector("input[name='technical_training']").value =
      validateDisplayedData(dataRow.technical_training);

    document.querySelector("input[name='technical_year']").value =
      validateDisplayedData(dataRow.technical_year);

    document.querySelector("input[name='technical_course']").value =
      validateDisplayedData(dataRow.technical_course);

    //handle the radion button group
    document.querySelector("input[name='review1']").value =
      validateDisplayedData(dataRow.review1);

    const radVal = validateDisplayedData(dataRow.review1_status); // 'ongoing' or 'completed'
    let radio = document.querySelector(
      `input[name='review1_status'][value = '${radVal}']`,
    );
    if (radio !== null) {
      radio.checked = true; //set the appropriate radio button
    }
    document.querySelector("input[name='review2']").value =
      validateDisplayedData(dataRow.review2);
    const radVal2 = validateDisplayedData(dataRow.review2_status);
    let radio2 = document.querySelector(
      `input[name='review2_status'][value = '${radVal2}']`,
    );
    if (radio2 !== null) {
      radio2.checked = true;
    }
    document.querySelector("input[name='review3']").value =
      validateDisplayedData(dataRow.review3);
    const radVal3 = validateDisplayedData(dataRow.review3_status);
    let radio3 = document.querySelector(
      `input[name='review3_status'][value = '${radVal3}']`,
    );
    if (radio3 !== null) {
      radio3.checked = true;
    }


    document.querySelector("input[name='exam1']").value =
      validateDisplayedData(dataRow.exam1);

    document.querySelector("input[name='exam1_year']").value =
      validateDisplayedData(dataRow.exam1_year);

    document.querySelector("input[name='exam2']").value =
      validateDisplayedData(dataRow.exam2);

    document.querySelector("input[name='exam2_year']").value =
      validateDisplayedData(dataRow.exam2_year);

    document.querySelector("input[name='exam3']").value =
      validateDisplayedData(dataRow.exam3);

    document.querySelector("input[name='exam3_year']").value =
      validateDisplayedData(dataRow.exam3_year);

    document.querySelector("input[name='exam4']").value =
      validateDisplayedData(dataRow.exam4);

    document.querySelector("input[name='exam4_year']").value =
      validateDisplayedData(dataRow.exam4_year);

    document.querySelector("input[name='exam5']").value =
      validateDisplayedData(dataRow.exam5);

    document.querySelector("input[name='exam5_year']").value =
      validateDisplayedData(dataRow.exam5_year);

    document.querySelector("input[name='exam6']").value =
      validateDisplayedData(dataRow.exam6);

    document.querySelector("input[name='exam6_year']").value =
      validateDisplayedData(dataRow.exam6_year);

    document.querySelector("input[name='exam7']").value =
      validateDisplayedData(dataRow.exam7);

    document.querySelector("input[name='exam7_year']").value =
      validateDisplayedData(dataRow.exam7_year);

    document.querySelector("input[name='exam8']").value =
      validateDisplayedData(dataRow.exam8);

    document.querySelector("input[name='exam8_year']").value =
      validateDisplayedData(dataRow.exam8_year);




    //REGISTERED NURSES SECTION//
    document.querySelector("input[name='chk_reg_nurse_bsc']").checked =
      +validateDisplayedData(dataRow.chk_reg_nurse_bsc);

    document.querySelector(
      "input[name='chk_reg_nurse_diploma_nursing']",
    ).checked = +validateDisplayedData(dataRow.chk_reg_nurse_diploma_nursing);

    document.querySelector("input[name='chk_reg_nurse_midwifery']").checked =
      +validateDisplayedData(dataRow.chk_reg_nurse_midwifery);

    document.querySelector("input[name='chk_reg_nurse_masters']").checked =
      +validateDisplayedData(dataRow.chk_reg_nurse_masters);

    document.querySelector("input[name='chk_reg_nurse_phd']").checked =
      +validateDisplayedData(dataRow.chk_reg_nurse_phd);

    document.querySelector("input[name='chk_reg_nurse_other']").checked =
      +validateDisplayedData(dataRow.chk_reg_nurse_other);

    document.querySelector("input[name='nursing_other']").value =
      validateDisplayedData(dataRow.nursing_other);


    //PHYSICAL THERAPISTS SECTION//
    document.querySelector("input[name='chk_pt_bsc_pt']").checked =
      +validateDisplayedData(dataRow.chk_pt_bsc_pt);

    document.querySelector("input[name='chk_pt_na']").checked =
      +validateDisplayedData(dataRow.chk_pt_na);


    //JOB SPECIALTIES//
    document.querySelector("input[name='chk_job_specialty_er']").checked =
      +validateDisplayedData(dataRow.chk_job_specialty_er);

    document.querySelector(
      "input[name='chk_job_specialty_med_surg']",
    ).checked = +validateDisplayedData(dataRow.chk_job_specialty_med_surg);

    document.querySelector(
      "input[name='chk_job_specialty_general']",
    ).checked = +validateDisplayedData(dataRow.chk_job_specialty_general);

    document.querySelector("input[name='chk_job_specialty_icu']").checked =
      +validateDisplayedData(dataRow.chk_job_specialty_icu);

    document.querySelector(
      "input[name='chk_job_specialty_telemetry']",
    ).checked = +validateDisplayedData(dataRow.chk_job_specialty_telemetry);

    document.querySelector("input[name='chk_job_specialty_pt']").checked =
      +validateDisplayedData(dataRow.chk_job_specialty_pt);

    document.querySelector(
      "input[name='chk_job_specialty_theater']",
    ).checked = +validateDisplayedData(dataRow.chk_job_specialty_theater);

    document.querySelector("input[name='chk_job_specialty_pcu']").checked =
      +validateDisplayedData(dataRow.chk_job_specialty_pcu);

    document.querySelector("input[name='chk_job_specialty_ot']").checked =
      +validateDisplayedData(dataRow.chk_job_specialty_ot);


    //PORTFOLIO LEVEL//
    document.querySelector("input[name='chk_staff_nurse']").checked =
      +validateDisplayedData(dataRow.chk_staff_nurse);

    document.querySelector("input[name='chk_charge_nurse']").checked =
      +validateDisplayedData(dataRow.chk_charge_nurse);

    document.querySelector("input[name='chk_senior_nurse']").checked =
      +validateDisplayedData(dataRow.chk_senior_nurse);

    document.querySelector("input[name='chk_director_nurse']").checked =
      +validateDisplayedData(dataRow.chk_director_nurse);

    document.querySelector("input[name='chk_head_nurse']").checked =
      +validateDisplayedData(dataRow.chk_head_nurse);

    document.querySelector("input[name='chk_sister_nurse']").checked =
      +validateDisplayedData(dataRow.chk_sister_nurse);



    //EXAMS PASSED//
    document.querySelector("input[name='nclex_year']").value =
      validateDisplayedData(dataRow.nclex_year);

    document.querySelector("input[name='cbt_year']").value =
      validateDisplayedData(dataRow.cbt_year);

    document.querySelector("input[name='ielts_year']").value =
      validateDisplayedData(dataRow.ielts_year);

    document.querySelector("input[name='haad_year']").value =
      validateDisplayedData(dataRow.haad_year);

    document.querySelector("input[name='toefl_year']").value =
      validateDisplayedData(dataRow.toefl_year);

    document.querySelector("input[name='dha_year']").value =
      validateDisplayedData(dataRow.dha_year);

    document.querySelector("input[name='oet_year']").value =
      validateDisplayedData(dataRow.oet_year);

    document.querySelector("input[name='prometric_year']").value =
      validateDisplayedData(dataRow.prometric_year);

    document.querySelector("input[name='other_exam_year']").value =
      validateDisplayedData(dataRow.other_exam_year);

    document.querySelector("input[name='pt_ot_year']").value =
      validateDisplayedData(dataRow.pt_ot_year);



    //LICENSES / IDS//
    document.querySelector("input[name='prc_number']").value =
      validateDisplayedData(dataRow.prc_number);

    document.querySelector("input[name='prc_issued']").value =
      validateDisplayedData(dataRow.prc_issued).substring(0, 10);

    document.querySelector("input[name='prc_expiry']").value =
      validateDisplayedData(dataRow.prc_expiry).substring(0, 10);

    // SSS / GSIS
    document.querySelector("input[name='sss_number']").value =
      validateDisplayedData(dataRow.sss_number);

    document.querySelector("input[name='sss_issued']").value =
      validateDisplayedData(dataRow.sss_issued).substring(0, 10);

    document.querySelector("input[name='sss_expiry']").value =
      validateDisplayedData(dataRow.sss_expiry).substring(0, 10);

    // DRIVER’S LICENSE
    document.querySelector("input[name='driver_number']").value =
      validateDisplayedData(dataRow.driver_number);

    document.querySelector("input[name='driver_issued']").value =
      validateDisplayedData(dataRow.driver_issued).substring(0, 10);

    document.querySelector("input[name='driver_expiry']").value =
      validateDisplayedData(dataRow.driver_expiry).substring(0, 10);

    // PASSPORT
    document.querySelector("input[name='passport_number']").value =
      validateDisplayedData(dataRow.passport_number);

    document.querySelector("input[name='passport_issued']").value =
      validateDisplayedData(dataRow.passport_issued).substring(0, 10);

    document.querySelector("input[name='passport_expiry']").value =
      validateDisplayedData(dataRow.passport_expiry).substring(0, 10);

    // PLACE OF ISSUE
    document.querySelector("input[name='place_of_issue']").value =
      validateDisplayedData(dataRow.place_of_issue);


    //SEMINARS / WORKSHOPS//
    document.querySelector("input[name='item1_name']").value =
      validateDisplayedData(dataRow.item1_name);

    document.querySelector("input[name='item1_value']").value =
      validateDisplayedData(dataRow.item1_value);

    document.querySelector("input[name='item2_name']").value =
      validateDisplayedData(dataRow.item2_name);

    document.querySelector("input[name='item2_value']").value =
      validateDisplayedData(dataRow.item2_value);

    document.querySelector("input[name='item3_name']").value =
      validateDisplayedData(dataRow.item3_name);

    document.querySelector("input[name='item3_value']").value =
      validateDisplayedData(dataRow.item3_value);

    document.querySelector("input[name='item4_name']").value =
      validateDisplayedData(dataRow.item4_name);

    document.querySelector("input[name='item4_value']").value =
      validateDisplayedData(dataRow.item4_value);

    document.querySelector("input[name='item5_name']").value =
      validateDisplayedData(dataRow.item5_name);

    document.querySelector("input[name='item5_value']").value =
      validateDisplayedData(dataRow.item5_value);



    //WORK EXPERIENCE//
    document.querySelector("input[name='company1']").value =
      validateDisplayedData(dataRow.company1);

    document.querySelector("input[name='position1']").value =
      validateDisplayedData(dataRow.position1);

    document.querySelector("input[name='country1']").value =
      validateDisplayedData(dataRow.country1);

    document.querySelector("input[name='year1']").value =
      validateDisplayedData(dataRow.year1);

    // ----------------------

    document.querySelector("input[name='company2']").value =
      validateDisplayedData(dataRow.company2);

    document.querySelector("input[name='position2']").value =
      validateDisplayedData(dataRow.position2);

    document.querySelector("input[name='country2']").value =
      validateDisplayedData(dataRow.country2);

    document.querySelector("input[name='year2']").value =
      validateDisplayedData(dataRow.year2);

    // ----------------------

    document.querySelector("input[name='company3']").value =
      validateDisplayedData(dataRow.company3);

    document.querySelector("input[name='position3']").value =
      validateDisplayedData(dataRow.position3);

    document.querySelector("input[name='country3']").value =
      validateDisplayedData(dataRow.country3);

    document.querySelector("input[name='year3']").value =
      validateDisplayedData(dataRow.year3);

    // ----------------------

    document.querySelector("input[name='company4']").value =
      validateDisplayedData(dataRow.company4);

    document.querySelector("input[name='position4']").value =
      validateDisplayedData(dataRow.position4);

    document.querySelector("input[name='country4']").value =
      validateDisplayedData(dataRow.country4);

    document.querySelector("input[name='year4']").value =
      validateDisplayedData(dataRow.year4);

    // ----------------------

    document.querySelector("input[name='company5']").value =
      validateDisplayedData(dataRow.company5);

    document.querySelector("input[name='position5']").value =
      validateDisplayedData(dataRow.position5);

    document.querySelector("input[name='country5']").value =
      validateDisplayedData(dataRow.country5);

    document.querySelector("input[name='year5']").value =
      validateDisplayedData(dataRow.year5);

    // ----------------------

    document.querySelector("input[name='company6']").value =
      validateDisplayedData(dataRow.company6);

    document.querySelector("input[name='position6']").value =
      validateDisplayedData(dataRow.position6);

    document.querySelector("input[name='country6']").value =
      validateDisplayedData(dataRow.country6);

    document.querySelector("input[name='year6']").value =
      validateDisplayedData(dataRow.year6);



    //JOB DESCRIPTION SECTION//
    document.querySelector("textarea[name='job_desc1']").value =
      validateDisplayedData(dataRow.job_desc1);

    document.querySelector("textarea[name='job_desc2']").value =
      validateDisplayedData(dataRow.job_desc2);

    document.querySelector("textarea[name='job_desc3']").value =
      validateDisplayedData(dataRow.job_desc3);

    document.querySelector("textarea[name='job_desc4']").value =
      validateDisplayedData(dataRow.job_desc4);

    document.querySelector("textarea[name='job_desc5']").value =
      validateDisplayedData(dataRow.job_desc5);

    document.querySelector("textarea[name='job_desc6']").value =
      validateDisplayedData(dataRow.job_desc6);



    //AWARDS RECEIVED//
    document.querySelector("input[name='field1']").value =
      validateDisplayedData(dataRow.field1);

    document.querySelector("input[name='field2']").value =
      validateDisplayedData(dataRow.field2);

    document.querySelector("input[name='field3']").value =
      validateDisplayedData(dataRow.field3);

    document.querySelector("input[name='field4']").value =
      validateDisplayedData(dataRow.field4);

    document.querySelector("input[name='field5']").value =
      validateDisplayedData(dataRow.field5);

    document.querySelector("input[name='field6']").value =
      validateDisplayedData(dataRow.field6);



    //CERTIFICATES//
    document.querySelector("input[name='certificate1']").value =
      validateDisplayedData(dataRow.certificate1);

    document.querySelector("input[name='certificate2']").value =
      validateDisplayedData(dataRow.certificate2);

    document.querySelector("input[name='certificate3']").value =
      validateDisplayedData(dataRow.certificate3);

    document.querySelector("input[name='certificate4']").value =
      validateDisplayedData(dataRow.certificate4);

    document.querySelector("input[name='certificate5']").value =
      validateDisplayedData(dataRow.certificate5);

    document.querySelector("input[name='certificate6']").value =
      validateDisplayedData(dataRow.certificate6);



    //REFEREES//
    document.querySelector("input[name='ref1_name']").value =
      validateDisplayedData(dataRow.ref1_name);

    document.querySelector("input[name='ref1_phone']").value =
      validateDisplayedData(dataRow.ref1_phone);

    document.querySelector("input[name='ref1_address']").value =
      validateDisplayedData(dataRow.ref1_address);



    //REFEREE 2//
    document.querySelector("input[name='ref2_name']").value =
      validateDisplayedData(dataRow.ref2_name);

    document.querySelector("input[name='ref2_phone']").value =
      validateDisplayedData(dataRow.ref2_phone);

    document.querySelector("input[name='ref2_address']").value =
      validateDisplayedData(dataRow.ref2_address);


    //SPONSORSHIP SECTION//
    document.querySelector("input[name='previous_sponsor']").value =
      validateDisplayedData(dataRow.previous_sponsor);

    document.querySelector("input[name='sponsored_activities']").value =
      validateDisplayedData(dataRow.sponsored_activities);

    document.querySelector("input[name='sponsor_amount']").value =
      validateDisplayedData(dataRow.sponsor_amount);



    //SUBMITTED REQUIREMENTS//
    document.querySelector("input[name='requirement1']").value =
      validateDisplayedData(dataRow.requirement1);

    document.querySelector("input[name='requirement2']").value =
      validateDisplayedData(dataRow.requirement2);

    document.querySelector("input[name='requirement3']").value =
      validateDisplayedData(dataRow.requirement3);

    document.querySelector("input[name='requirement4']").value =
      validateDisplayedData(dataRow.requirement4);



    //FAMILY SECTION//
    document.querySelector("input[name='children_count']").value =
      validateDisplayedData(dataRow.children_count);

    document.querySelector("input[name='children_ages']").value =
      validateDisplayedData(dataRow.children_ages);

    document.querySelector("input[name='spouse_name']").value =
      validateDisplayedData(dataRow.spouse_name);

    document.querySelector("input[name='spouse_occupation']").value =
      validateDisplayedData(dataRow.spouse_occupation);

    document.querySelector("input[name='spouse_birthdate']").value =
      validateDisplayedData(dataRow.spouse_birthdate).substring(0, 10);



    //Parents//
    document.querySelector("input[name='father_name']").value =
      validateDisplayedData(dataRow.father_name);

    document.querySelector("input[name='father_occupation']").value =
      validateDisplayedData(dataRow.father_occupation);

    document.querySelector("input[name='mother_name']").value =
      validateDisplayedData(dataRow.mother_name);

    document.querySelector("input[name='mother_occupation']").value =
      validateDisplayedData(dataRow.mother_occupation);

    document.querySelector("input[name='parents_address']").value =
      validateDisplayedData(dataRow.parents_address);

    document.querySelector("input[name='parents_phone']").value =
      validateDisplayedData(dataRow.parents_phone);

    document.querySelector("input[name='parents_mobile']").value =
      validateDisplayedData(dataRow.parents_mobile);



    //NEXT OF KIN//
    document.querySelector("input[name='nok_name']").value =
      validateDisplayedData(dataRow.nok_name);

    document.querySelector("input[name='nok_relationship']").value =
      validateDisplayedData(dataRow.nok_relationship);

    document.querySelector("input[name='nok_address']").value =
      validateDisplayedData(dataRow.nok_address);

    document.querySelector("input[name='nok_phone']").value =
      validateDisplayedData(dataRow.nok_phone);

    document.querySelector("input[name='nok_email']").value =
      validateDisplayedData(dataRow.nok_email);



    //BENEFICIARIES//
    document.querySelector("input[name='beneficiary1_name']").value =
      validateDisplayedData(dataRow.beneficiary1_name);

    document.querySelector("input[name='beneficiary1_relationship']").value =
      validateDisplayedData(dataRow.beneficiary1_relationship);

    document.querySelector("input[name='beneficiary1_address']").value =
      validateDisplayedData(dataRow.beneficiary1_address);

    document.querySelector("input[name='beneficiary1_phone']").value =
      validateDisplayedData(dataRow.beneficiary1_phone);



    //Beneficiary 2//
    document.querySelector("input[name='beneficiary2_name']").value =
      validateDisplayedData(dataRow.beneficiary2_name);

    document.querySelector("input[name='beneficiary2_relationship']").value =
      validateDisplayedData(dataRow.beneficiary2_relationship);

    document.querySelector("input[name='beneficiary2_address']").value =
      validateDisplayedData(dataRow.beneficiary2_address);

    document.querySelector("input[name='beneficiary2_phone']").value =
      validateDisplayedData(dataRow.beneficiary2_phone);



    //Beneficiary 3//
    document.querySelector("input[name='beneficiary3_name']").value =
      validateDisplayedData(dataRow.beneficiary3_name);

    document.querySelector("input[name='beneficiary3_relationship']").value =
      validateDisplayedData(dataRow.beneficiary3_relationship);

    document.querySelector("input[name='beneficiary3_address']").value =
      validateDisplayedData(dataRow.beneficiary3_address);

    document.querySelector("input[name='beneficiary3_phone']").value =
      validateDisplayedData(dataRow.beneficiary3_phone);




  } catch (error) {
    console.log('Error occured while populating form: ', error);
    return false;
  } return true;
}


