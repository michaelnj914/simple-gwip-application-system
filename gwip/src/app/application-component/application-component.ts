import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedService } from '../shared-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-application-component',
  imports: [FormsModule, CommonModule],
  templateUrl: './application-component.html',
  styleUrl: './application-component.scss',
})
export class ApplicationComponent {

  router = inject(Router);
  sharedService = inject(SharedService);

  isPublicPage = input({ defaultValue: true }); // Signal to indicate if the current page is a public page (like login) 
  // or a protected page(like dashboard). This can be used to conditionally show/hide certain UI elements based on whether the user is logged in or not.
  fileDate = new Date().toISOString().split('T')[0]; // Set the file date to today's date in YYYY-MM-DD format
  ngOnInit() {
    // This is where you can initialize any data or perform any setup when the component is loaded
    //set file date to today
  }

  async submitApplication(applicationForm: any) {
    applicationForm.fileDate = this.fileDate; // Set the file date to today's date

    //iterate over the form data and change any 'false' value to 0 and any true value to 1
    for (const key in applicationForm) {
       console.log('key:', applicationForm[key]);
      if (applicationForm[key] === false) {       
        applicationForm[key] = 0;
      } else if (applicationForm[key] === true) {
        applicationForm[key] = 1;
      }
    }
    const response = await this.sharedService.callAPI('application_service.php', 'create-application', applicationForm);
    if (response.success) {
      //Upload the photo if any
      console.log(response.result);
      console.log('Application submitted with data:', applicationForm);
      alert('Application submitted successfully!');
    }


  }

  async getOneApplication(applicationId: string) {

  }

  async deleteApplication(applicationId: string) {
    const obj = { id: applicationId };
    const response = await this.sharedService.callAPI('application_service.php', 'delete-application', obj);
    alert(response.message);
  }

  navigateToHome() {
    this.router.navigate(['/home']);
  }
}
