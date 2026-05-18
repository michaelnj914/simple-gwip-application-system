import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedService } from '../../shared-service';

@Component({
  selector: 'app-users-component',
  imports: [FormsModule, CommonModule],
  templateUrl: './users-component.html',
  styleUrl: './users-component.scss',
})
export class UsersComponent {
  router = inject(Router); // Inject the Router to enable navigation between pages. We will use this to navigate back to the dashboard when closing the users page.
  sharedService = inject(SharedService); // Inject the SharedService to use its methods for API calls and other shared functionalities.

  //array to hold the list of users
  usersList = signal<any[]>([]); //We use a signal here because we want the UI to automatically update when the list of users changes.
  // When we set usersList, the UI will reactively update to reflect the new list of users.
  errorMessage: string = ''; // Variable to hold error messages

  ngOnInit() {
    // This is where you can initialize any data or perform any setup when the component is loaded
    this.getusersList(); // Load the list of users when the component is initialized
  }

  afterViewInit() {
    // const frm: any = document.getElementById('userFrm');
    // if (frm) {
    //   frm.value.role = ''; // clear the Role dropdowna
    // }
  } 

  async getusersList() {
    const data = await this.sharedService.callAPI('users_service.php', 'get-users', null);
    if (data.success) {
      this.usersList.set(data.result); // Set the users array = data.result;
    } else {
      this.errorMessage = data.message;
      console.error('Failed to load users:', data.message);
    }
    return;
  }


  async createUser(userFrm: any) {
   // console.log('Creating user with data:', userFrm);
   // let formData = new FormData();
   // formData = userFrm; //We can directly use the form data as FormData for our API call, no need to manually append each field.
    try {
      //We use await here because we want to wait for the response before proceeding. 
      // This allows us to handle the response in a more linear and readable way.
      const response = await this.sharedService.callAPI('users_service.php', 'create-user', userFrm);
      if (response.success) {
       await this.getusersList();           
      }
      return;
    } catch (error) {
        console.error('Error creating user:', error);
        alert('An error occurred while creating the user. Please try again.');
      }
  }

  deleteUser(userId:number) {
    //first confirm the deletion
    if (confirm('Are you sure you want to delete this user?') === false) {
      return false; //user cancelled
    }
    // prepare to make the request to the server. Put the ID into an object
   const obj = { id: userId }; //We can directly use an object here, the callAPI method will convert it to FormData internally.
   
    try {
      // make the request. Notice we are not using await here because we want to handle the response in the .then() callback.
      //This is just an alternative way of doing things, you could also use await if you prefer that style.
      this.sharedService.callAPI('users_service.php', 'delete-user', obj).then((response) => {
        if (response.success) {
          this.getusersList(); //reload the list of users after deletion
        } else {
          alert(response.message);
        }
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('An error occurred while deleting the user. Please try again.');
    }
    return;
  }

  closeUsers() {
  //To close this users page we simply navigate back to the Parent, which is the dashboard.
  this.router.navigate(['/dashboard']); //The default page here is the ApplicationsList component
  }





  
}
