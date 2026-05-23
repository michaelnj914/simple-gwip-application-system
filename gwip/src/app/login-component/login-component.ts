import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedService } from '../shared-service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-component',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login-component.html',
  styleUrl: './login-component.scss',
})
export class LoginComponent {
  sharedService = inject(SharedService);
  router = inject(Router);
  errorMessage = signal<string>('');


  async doLogin(frm: any) {
    this.errorMessage.set(''); // Clear any previous error messages
     //checks
    if (frm && frm.username.length === 0) {
      this.errorMessage.set('Please enter a username');
      return;
    }
    if (frm && frm.password.length === 0) {
      this.errorMessage.set('Please enter a password');
      return;
    }
    
    const data = await this.sharedService.callAPI('users_service.php', 'login', frm);
    if (data.success) {
      // Save the logged-in user information in localStorage as a stringified JSON object (data.result);
      localStorage.setItem('loggedInUser', JSON.stringify(data.result)); 
      // Redirect the user to the dashboard page
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/login']);
     this.errorMessage.set(data.message);
    }
    
    
  }
}
