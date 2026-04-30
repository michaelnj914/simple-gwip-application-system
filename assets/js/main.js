
//set the file date on the form to thecurrent date
document.getElementById("file-date").textContent = new Date().toLocaleDateString();
photo = undefined; // for photo upload
const submitBtn = document.getElementById("submitBtn");

//submit application
document.getElementById("applicationForm").addEventListener("submit", async function (e) {

  e.preventDefault(); // stop normal form submission

  let firstName = document.querySelector("input[name='firstName']").value;
  let lastName = document.querySelector("input[name='lastName']").value;

  const name = firstName.toUpperCase() + " " + lastName.toUpperCase(); //will use this later

  // Disable button while submitting
  submitBtn.disabled = true; //disable the submit button
  submitBtn.textContent = "Submitting...";

  document.getElementById("responseMessage").textContent = "Submitting your application...";

  const myform = document.getElementById("applicationForm");
  const formData = new FormData(myform);

  // add a filedate field to the form data
  formData.append('filedate', new Date().toLocaleDateString('en-CA')); //<== UNCOMMENT THIS LINE TO USE THIS FEATURE

  const myHeaders = {
    'api-command': 'create-application'
  };

  const response = await fetch(myform.action, { method: myform.method, body: formData, headers: myHeaders });
  const data = await response.json(); // we need this line to get our response

  if (data.success) {
    //if the application was submitted successfully then an ID of the record will be returned in the response's result property
    //We need this ID to modify the record, to write back the photo information
    const id = data.result;
    //upload the photo if it exists.  This will return a promise so we can use AWAIT on it.
    if (photo !== undefined) {
      await doPhotoUpload(id, photo); //do photo upload if possible and wait for it to complete
    }
    //if the photo upload was done. Successfull or not we continue and round up...
    submitBtn.disabled = false; //re-enable the submit button
    submitBtn.textContent = "Submit";
    document.getElementById("responseMessage").textContent = "";
    document.getElementById("success-dialog").showModal();//show modal dialog
    document.getElementById("success-message").textContent = name + ", your application was submitted successfully!";
    setTimeout(() => { //delay for 5 seconds
      document.getElementById("success-dialog").close();//remove modal dialog
      clearPhoto();//clear the photo
      myform.reset(); //clear the form
      window.scrollTo(0, 0); //scroll to top of the page/form
    }, 5000);

  } else { //application submission failed
    // Handle error response
    document.getElementById("responseMessage").textContent = data.message;
    submitBtn.disabled = false; //re-enable the submit button
    submitBtn.textContent = "Submit";
  }
});


//+++++++++++++++++++++++++++++++++++++++++++++++++
// ==== PHOTO ======================================
//+++++++++++++++++++++++++++++++++++++++++++++++++
// The following code selects a photo but does not upload it.
//It is just shown in a preview area on the form
const photoSelector = document.getElementById('photo-picker'); //photo selector
const imgPreview = document.getElementById('img-preview'); //this is hidden by default

photoSelector.addEventListener('change', (event) => {
  photo = event.target.files[0]; // Get the selected photo when the input is clicked
  if (photo) {
    imgPreview.src = URL.createObjectURL(photo); // Create a temporary URL
    imgPreview.style.display = 'block'; // show the preview image element
  }
});
//==== end of photo selector =================================

//Clears the photo from the UI. Done after a successful upload
clearPhoto = () => {
  URL.revokeObjectURL(imgPreview.src)
  imgPreview.style.display = 'none'; // hide the preview image element
}
//==== end of clearPhoto =================================

//==== Upload the photo ============================== 
/**
 * Our photo upload function.
The strategy is to upload the photo to the server first and then update the record in the database with the photo's filename
We save the photo to a folder on the server.
 * @param {*} recordID 
 * @param {*} photo 
 * @returns A promise of boolean type
 */
function doPhotoUpload(recordID, photo) {
  return new Promise(async (resolve) => { // we use a promise because the upload may take a while to complete
    if (!photo) resolve(false); // if no photo was selected then do nothing and return immediately
    const formData = new FormData();
    //command to upload the photo
    const command = 'upload-photo'; //this will be read on the server to route to the appropriate function
    //add an http header
    myHeaders = {
      'api-command': command
    };
    formData.append('photofile', photo, photo.name); //the bytes that make up the photo
    formData.append('id', recordID); // id of the application in the database
    formData.append('tablename', 'application'); //table name where we will save the photo filename only
    formData.append('fieldname', 'photo'); //name of the field in the table where we will save the filename

    const response = await fetch('api/photo_service.php', { method: 'POST', headers: myHeaders, body: formData });
    const data = await response.json();

    if (data.success) {
      resolve(true);
    } else {
      resolve(false);
    }
  });
}
