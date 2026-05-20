import { CommonModule } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedService } from '../shared-service';
import { Router, ActivatedRoute } from '@angular/router';
import { IApplicationForm } from '../app.interfaces';

@Component({
  selector: 'app-application-component',
  imports: [FormsModule, CommonModule],
  templateUrl: './application-component.html',
  styleUrl: './application-component.scss',
})
export class ApplicationComponent {

  router = inject(Router);
  route = inject(ActivatedRoute);
  sharedService = inject(SharedService);

  isPublicPage = true; // Signal to indicate if the current page is a public page (like login) 
  // or a protected page(like dashboard). This can be used to conditionally show/hide certain UI elements based on whether the user is logged in or not.
  fileDate = new Date().toISOString().split('T')[0]; // Set the file date to today's date in YYYY-MM-DD format
  isSubmitting = signal<boolean>(false); // Signal to indicate if the form is currently being submitted. 
  //This can be used to disable the submit button and show a loading indicator while the form is being submitted.
  successMessage = signal<string>(''); // Signal to hold the success message to display after form submission
  errorMessage = signal<string>(''); // Signal to hold the error message to display if form submission fails
  applicantName = signal<string>('');
  photo = null; // this variable will hold the selected photo file
  imgPreview: HTMLImageElement | null = null; //empty object  
  applyObj: IApplicationForm | null = null; //to hold application form from database
  applyId: number = 0; //to hold application id passed in the URL. Called from application list component when a row is clicked
  //==============================================================================================================

  ngOnInit() {


    window.scrollTo(0, 0); // Scroll to the top of the page when the component is initialized
    this.imgPreview = document.getElementById('img-preview') as HTMLImageElement; //used for photo preview
    if ((this.route.snapshot.params['id'])) {
      //catch incoming route parameters
      if (this.route.snapshot.params['id']) this.applyId = Number(this.route.snapshot.params['id']);
      if (this.route.snapshot.params['isPublicPage']) this.isPublicPage = this.route.snapshot.params['isPublicPage'];
      this.openOneApplication(this.applyId);
    }

  }

  async openOneApplication(applyId: number) {

    const obj = { id: applyId };
    const response = await this.sharedService.callAPI('application_service.php', 'get-one-application', obj);
    if (response.success) {
      this.applyObj = response.result;
    }
  }


  printApplication = () => {
    window.print();
  }



  async submitApplication(applicationForm: any) {
    applicationForm.fileDate = this.fileDate; // Set the file date to today's date
    // Set the applicant name signal to the value from the form. This will be used in the success message after submission.
    this.applicantName.set(applicationForm.firstName.toUpperCase() + ' ' + applicationForm.lastName.toUpperCase());
    // Iterate over the form data and change any 'false' value to 0 and any 'true' value to 1
    // We use 1 and 0 for checkboxes in the database, but in the form they are represented as true and false. 
    // So we need to convert them before sending to the API.
    for (const key in applicationForm) {
      if (applicationForm[key] === false) {
        applicationForm[key] = 0;
      } else if (applicationForm[key] === true) {
        applicationForm[key] = 1;
      }
    }
    this.isSubmitting.set(true); // Set the submitting state to true to disable the submit button and show loading indicator
    const response = await this.sharedService.callAPI('application_service.php', 'create-application', applicationForm);
    this.isSubmitting.set(false); // Set the submitting state back to false after the API call is complete
    if (response.success) {
      const appId = response.result;// newly created application ID returned from the API after successful creation of the application.
      // This can be used to upload the photo for the application if there is any photo to upload.
      //Upload the photo if any
      if (this.photo) {
        await this.doPhotoUpload(appId, this.photo);
      }


      this.successMessage.set(this.applicantName() + ', Your application was submitted successfully');
      setTimeout(() => {
        this.successMessage.set('');
        //clear the form fields
        this.applicantName.set('');
        const frm = document.getElementById('appl-form') as HTMLFormElement;
        if (frm) {
          frm.reset(); // reset the form
        }
        this.clearPhoto();  //clear the photo from the UI 
        window.scrollTo(0, 0); //scroll to the top of the page

      }, 5000); // 5 second interval

    } else {
      this.errorMessage.set(response.message);
    }
  }

  navigateToHome() {
    this.router.navigate(['/home']);
  }

  navigateToApplicationList() {
    this.router.navigate(['/dashboard/applicationlist']);
  }


  //+++++++++++++++++++++++++++++++++++++++++++++++++
  // ==== PHOTO ======================================
  //+++++++++++++++++++++++++++++++++++++++++++++++++
  // The following code selects a photo but does not upload it.
  //It is just shown in a preview area on the form
  // const photoSelector = document.getElementById('photo-picker'); //photo selector
  // const imgPreview = document.getElementById('img-preview'); //this is hidden by default

  selectPhoto(event: any) {
    this.photo = event.target.files[0]; // Get the selected photo when the input is clicked
    this.imgPreview = document.getElementById('img-preview') as HTMLImageElement;
    if (this.photo && this.imgPreview) {
      this.imgPreview.src = URL.createObjectURL(this.photo); // Create a temporary URL
      // this.imgPreview.style.display = 'block'; // show the preview image element
    }
  }
  //==== end of photo selector =================================

  //Clears the photo from the UI. Done after a successful upload
  clearPhoto() {
    if (this.imgPreview) {
      URL.revokeObjectURL(this.imgPreview.src);
      this.imgPreview.src = '';
      // this.imgPreview.style.display = 'none'; // hide the preview image element 
    }
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
  doPhotoUpload(recordID: number, photo: any) {
    return new Promise(async (resolve) => { // we use a promise because the upload may take a while to complete
      if (!photo) resolve(false); // if no photo was selected then do nothing and return immediately
      const formObj = {
        photofile: photo, //the bytes that make up the photo
        id: recordID.toString(), // id of the application in the database
        tablename: 'application', //table name where we will save the photo filename only
        fieldname: 'photo' //name of the field in the table where we will save the filename
      };
      const response = await this.sharedService.callAPI('photo_service.php', 'upload-photo', formObj);

      if (response.success) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }


  /**
   * As we return the data from our server as JSON, we need to check if the data is defined or null
   * @param {*} obj  object
   * @returns empty string if object is not defined or null else it returns the object
   */
  validateDisplayedData(obj: any) {
    if (obj !== undefined && obj !== null) {
      return obj;
    } else {
      return '';
    }
  }
}
