
window.addEventListener("load", async function () {
    // Don't show our read-only form on this page that is used to display the details of one application
    document.getElementById('viewable-application').style.display = 'none'; 

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

    //continue if there are applications
    const tableBody = document.getElementById('table-body');
    let tbody = '';
    //Use a loop to build up table rows out of the returned data
    data.result.forEach((item) => {
        let photoURL = 'api/uploads/';
        let photoObj = ''; //prepare for each photo
        if (item.photo === null) {
            photoObj = '-'; //No photo
        } else {
            photoObj = '<img src=' + photoURL + item.photo + ' style="height: 50px;"  />'; //display the photo
        }

        tbody += '<tr class="apply-table-row" onclick="getOneApplication(' + item.id + ')" >' +
            '<td>' + photoObj + '</td>' +
            '<td></td>' +
            '<td>' + item.lastName + ', ' + item.firstName + '</td>' +
            '<td>' + computeAgeFromDate(item.birthdate) + '</td>' + //will compute the age from the date of birth
            '<td>' + item.applyFor + '</td>' +
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
async function getOneApplication(applyId) {
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
            // Show the hidden form
            document.getElementById("viewable-application").style.display = "block";
            populateForm(data.result);//populate the form with the returned data
            //scroll to the top of the page
            window.scrollTo(0, 0);
        }
    } catch (error) {
        console.log('Error occured while obtaining application: ', error);
        alert("Something went wrong!" + error);
    }
}

function populateForm(dataRow) {
    //disable all inputs, selects and textareas
    const formElements = document.querySelectorAll('#viewable-application input, #viewable-application select, #viewable-application textarea');

    // Loop through each element and make read-only, disabled and apply some css properties
    formElements.forEach(element => {
        element.readOnly = true;
        element.disabled = true;
        //style the elements
        element.style.color = 'blue';
        element.style.fontWeight = 'bold';
        element.style.fontSize = '1rem';
    });
    try {
          document.querySelector("input[name='firstName']").value = dataRow.firstName || '';
    document.querySelector("input[name='lastName']").value = dataRow.lastName || '';
    document.querySelector("input[name='birthdate']").value = dataRow.birthdate? dataRow.birthdate.substring(0, 10) : '';
    document.querySelector("input[name='applyFor']").value = dataRow.applyFor? dataRow.applyFor : '';
    document.querySelector("input[name='photo']").value = dataRow.photo? dataRow.photo : '';
    document.querySelector("input[name='id']").value = dataRow.id? dataRow.id : '';

    } catch (error) {
        return false;
    }
      

        return true;

}

printApplication = () => {
    window.print();
}