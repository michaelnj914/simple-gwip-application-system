import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SharedService } from '../../shared-service';

@Component({
  selector: 'app-dashboard-component',
  imports: [RouterOutlet],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.scss',
})
export class DashboardComponent {
  router = inject(Router);
  sharedService = inject(SharedService);
  isAdmin = this.sharedService.userIsAdmin();

  userLastName = '';
  userFirstName = '';
  designation = '';

  ngOnInit() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
      const user = JSON.parse(loggedInUser);
      this.userLastName = user.lastname;
      this.userFirstName = user.firstname;
      this.designation = this.sharedService.getDesignationFromCode(+user.role); // user.designation;
    }
  }

  openUserEncoding() {
    this.router.navigate(['/dashboard/users']);
  }

  async logout() {
   const data = await this.sharedService.callAPI('users_service.php', 'logout', null);
    if (data.success) {
    localStorage.removeItem('loggedInUser');
    this.router.navigate(['/login']);
    }
    
  }
}
