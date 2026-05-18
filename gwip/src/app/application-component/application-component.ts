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

  submitApplication(applicationForm: any) {
    // Here you would typically handle the form submission, e.g. by sending the data to a server or processing it in some way.
    // For demonstration purposes, we'll just log the form data to the console.
    console.log('Application submitted with data:', applicationForm);
    alert('Application submitted successfully!');
  }

  navigateToHome() {
    this.router.navigate(['/home']);
  }
}
