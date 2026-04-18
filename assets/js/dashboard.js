
//Global variable to hold data array from the database
let dataArray = [];

window.addEventListener("load", async function () {
    // Don't show our read-only form on this page that is used to display the details of one application
    document.getElementById('printable-application').style.display = 'none';

    //Make sure our dashboard view is shown
    document.querySelector(".dashboard-wrapper").style.display = "block";
    await getApplicationList(); //get the list of applications after the page has loaded
});


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
            '<td></td>' +
            '<td style="text-align: left;"><b>' + item.lastName.toUpperCase() + '</b>, ' + item.firstName + '</td>' +
            '<td>' + computeAgeFromDate(item.birthdate) + '</td>' + //will compute the age from the date of birth
            '<td style="text-align: left;">' + item.applyFor + '</td>' +
            '<td><button class="delete-button" title="Delete Application" onclick="deleteApplication(' + item.id + ')">-- delete --</button></td>' +
            '</tr>';
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
        let photoObj = ''; //prepare for photo
        if (dataRow.photo === null) {
            photoObj = '-'; //No photo
        } else {
            photoObj = '<img src=' + photoFolder + dataRow.photo + ' style="width: 185px;margin:0 auto;"  />'; //display the photo
        }
        document.querySelector("input[name='applyFor']").value = validateDisplayedData(dataRow.applyFor).toUpperCase();
        document.getElementById("two-by-two").innerHTML = photoObj; //display the photo by injecting into the page
        document.querySelector("input[name='firstName']").value = validateDisplayedData(dataRow.firstName).toUpperCase();
        document.querySelector("input[name='lastName']").value = validateDisplayedData(dataRow.lastName).toUpperCase();
        document.querySelector("input[name='middleName']").value = validateDisplayedData(dataRow.middleName).toUpperCase();
        document.querySelector("input[name='email']").value = validateDisplayedData(dataRow.email);

        document.querySelector("input[name='first_choice']").value = validateDisplayedData(dataRow.first_choice).toUpperCase();
        document.querySelector("input[name='second_choice']").value = validateDisplayedData(dataRow.secondt_choice).toUpperCase();
        document.querySelector("input[name='third_choice']").value = validateDisplayedData(dataRow.third_choice).toUpperCase();

        document.querySelector("input[name='chk_directhire']").checked = +validateDisplayedData(dataRow.chk_directhire); //checkbox
        document.querySelector("input[name='chk_indirecthire']").checked = +validateDisplayedData(dataRow.chk_indirecthire); //checkbox
        document.querySelector("input[name='chk_gwiphire']").checked = +validateDisplayedData(dataRow.chk_gwiphire); //checkbox

        document.querySelector("input[name='birthDate']").value = validateDisplayedData(dataRow.birthDate).substring(0, 10);
        document.querySelector("input[name='phone']").value = validateDisplayedData(dataRow.phone);
        document.querySelector("select[name='civilStatus']").value = validateDisplayedData(dataRow.civilStatus); //select field
        document.querySelector("select[name='gender']").value = validateDisplayedData(dataRow.gender); //select field
        document.querySelector("input[name='address']").value = validateDisplayedData(dataRow.address);
        document.querySelector("input[name='alternateAddress']").value = validateDisplayedData(dataRow.alternateAddress);

        document.querySelector("input[name='height']").value = validateDisplayedData(dataRow.height);
        document.querySelector("input[name='weight']").value = validateDisplayedData(dataRow.weight);
        document.querySelector("input[name='religion']").value = validateDisplayedData(dataRow.religion);
        document.querySelector("input[name='highestEducational']").value = validateDisplayedData(dataRow.highestEducational);
        document.querySelector("input[name='courseTaken']").value = validateDisplayedData(dataRow.courseTaken);
        document.querySelector("input[name='experience']").value = validateDisplayedData(dataRow.experience);
        document.querySelector("input[name='hobbies']").value = validateDisplayedData(dataRow.hobbies);

        document.querySelector("input[name='university_name']").value = validateDisplayedData(dataRow.university_name);
        document.querySelector("input[name='university_location']").value = validateDisplayedData(dataRow.university_location);
        document.querySelector("input[name='university_year']").value = validateDisplayedData(dataRow.university_year);
        document.querySelector("input[name='university_course']").value = validateDisplayedData(dataRow.university_course);

        document.querySelector("input[name='college_name']").value = validateDisplayedData(dataRow.college_name);
        document.querySelector("input[name='college_location']").value = validateDisplayedData(dataRow.college_location);
        document.querySelector("input[name='college_year']").value = validateDisplayedData(dataRow.college_year);
        document.querySelector("input[name='college_course']").value = validateDisplayedData(dataRow.college_course);

        document.querySelector("input[name='highschool_name']").value = validateDisplayedData(dataRow.highschool_name);
        document.querySelector("input[name='highschool_location']").value = validateDisplayedData(dataRow.highschool_location);
        document.querySelector("input[name='highschool_year']").value = validateDisplayedData(dataRow.highschool_year);
        document.querySelector("input[name='highschool_course']").value = validateDisplayedData(dataRow.highschool_course);

        document.querySelector("input[name='elementary_name']").value = validateDisplayedData(dataRow.elementary_name);
        document.querySelector("input[name='elementary_location']").value = validateDisplayedData(dataRow.elementary_location);
        document.querySelector("input[name='elementary_year']").value = validateDisplayedData(dataRow.elementary_year);
        document.querySelector("input[name='elementary_course']").value = validateDisplayedData(dataRow.elementary_course);

        document.querySelector("input[name='technical_name']").value = validateDisplayedData(dataRow.technical_name);
        document.querySelector("input[name='technical_training']").value = validateDisplayedData(dataRow.technical_training);
        document.querySelector("input[name='technical_year']").value = validateDisplayedData(dataRow.technical_year);
        document.querySelector("input[name='technical_course']").value = validateDisplayedData(dataRow.technical_course);
        

        //handle the radion button group
        document.querySelector("input[name='review1']").value = validateDisplayedData(dataRow.review1);
        const radVal = validateDisplayedData(dataRow.review1_status); // 'ongoing' or 'completed'
        let radio = document.querySelector(`input[name='review1_status'][value = '${radVal}']`); 
        if (radio !== null) {
            radio.checked = true; //set the appropriate radio button
        }
        document.querySelector("input[name='review2']").value = validateDisplayedData(dataRow.review2);
        const radVal2 = validateDisplayedData(dataRow.review2_status);
        let radio2 = document.querySelector(`input[name='review2_status'][value = '${radVal2}']`);
        if (radio2 !== null) {
            radio2.checked = true;
        }
        document.querySelector("input[name='review3']").value = validateDisplayedData(dataRow.review3);
        const radVal3 = validateDisplayedData(dataRow.review3_status);
        let radio3 = document.querySelector(`input[name='review3_status'][value = '${radVal3}']`);
        if (radio3 !== null) {
            radio3.checked = true;
        }


    } catch (error) {
        console.log('Error occured while populating form: ', error);
        return false;
    } return true;
}