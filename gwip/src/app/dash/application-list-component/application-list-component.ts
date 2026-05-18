import { Component, inject, signal } from '@angular/core';
import { SharedService } from '../../shared-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-application-list-component',
  imports: [FormsModule, CommonModule],
  templateUrl: './application-list-component.html',
  styleUrl: './application-list-component.scss',
})
export class ApplicationListComponent {
  sharedService = inject(SharedService);
  applications = signal<any[]>([]); // Array to hold the list of applications

  errorMessage: string = ''; // Variable to hold error messages
  photoURL = 'api/uploads/'; // Base URL for application photos
  permissionLevel = 0;
  isAdmin = this.sharedService.userIsAdmin();


  async ngOnInit() {
    //set permission level for this page

    //load the list of applications when the component is initialized
    await this.loadApplications();
  }

  async loadApplications() {
    const data = await this.sharedService.callAPI('application_service.php', 'get-application-list', null);
    if (data.success) {
      this.applications.set(data.result); // Set the applications array = data.result;
      console.log('Loaded applications:', this.applications());
    } else {
      this.errorMessage = data.message;
      console.error('Failed to load applications:', data.message);
    }
    return;
  }


  //==================================================================
  /**
   * This function will delete an application
   * @param {*} applyId 
   */
  async deleteApplication(applyId: number) {
    //first confirm the deletion
    if (confirm('Are you sure you want to delete this application?') === false) {
      return false; //user cancelled
    }
    // prepare to make the request to the server
    const obj= { id: applyId }; //We can directly use an object here, the callAPI method will convert it to FormData internally. = new FormData();
   
    try {
      // make the request
      const data = await this.sharedService.callAPI('application_service.php', 'delete-application', obj);

      if (data.success) { //if the application was deleted successfully
        //reload the application list
        await this.loadApplications();
      }
    } catch (error) {
      console.log('Error occured while deleting application: ', error);
    }
    return;
  }

  //SEARCH FUNCTIONS ==================================================================
  /**
   * Search for applications by applicant's name. Will search by first name or last name
   * @param {*} event 
   * @returns true if data is found, false if not
   */
  searchByName(event: any) {
    const searchString = event.target.value; //extract our search string from the event
    if (searchString === '') { //if the search string is empty
      // renderTable(dataArray);// render the full list
      return false; //quit
    }
    //filter the list of applications by the incoming value. We will search by first name and last name
    //return any item where lastname or firstname contains the search string
    const filteredList = this.applications().filter(item => item.firstName.toLowerCase().includes(searchString.toLowerCase())
      || item.lastName.toLowerCase().includes(searchString.toLowerCase()));

    if (filteredList.length > 0) {
      //something was found
      // renderTable(filteredList); //render the result into the table
      return true;
    } else {
      //render empty array
      // renderTable([]);
      return false;
    }
  }

  /**
   * This function will search for applications by job category. If  the database job category starts with the search string
   * @param {*} event onKeyUp event, the search string has been entered
   * @returns true if data is found, false if not
   */
  searchByJobCategory(event: any) {
    const searchString = event.target.value; //extract our search string
    if (searchString === '') { //if the search string is empty
      //  renderTable(dataArray);// render the full list
      return false; //quit
    }
    //filter the list of applications by the incoming value. We will search by job_category
    //return any item where job_category begins with the search string
    const filteredList = this.applications().filter(item => item.applyFor.toLowerCase().startsWith(searchString.toLowerCase()));

    if (filteredList.length > 0) {
      //something was found
      // renderTable(filteredList); //render the result into the table
      return true;
    } else {
      //render an empty array
      //renderTable([]);
      return false;
    }
  }


}
