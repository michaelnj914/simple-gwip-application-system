
window.addEventListener("load", async function () {
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

        tbody += '<tr class="apply-table-row">' +
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