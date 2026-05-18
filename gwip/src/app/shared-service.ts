import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http'
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { IApiData } from './app.interfaces';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  //we will use the Angular http service to make http requests
  http: HttpClient = inject(HttpClient);

  isCallingAPI = signal<boolean>(false); // Signal to indicate if an API call is in progress.
  //This is accessible from any component that injects this SharedService, so you can use it to show a loading spinner or disable buttons while an API call is in progress.

  baseUrl = 'api/'; //relates to our backend API url
  /**
   * This function calls the backend and returns a Promise.
   * @param url Backend endpoint
   * @param apiCommand What command to send to the server
   * @param formData Collection of data to submit
   * @returns ApiData interface
   */
  async callAPI(url: string, apiCommand: string, incomingData: any) {
    let formData = new FormData();
    if (incomingData) {
      Object.keys(incomingData).forEach(key => {
        const value = incomingData[key];
        // Don't append null or undefined values unless your backend expects them
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
    } else { formData.append('', ''); }

    try {
      let headers = new HttpHeaders();
      headers = headers.set('ApiCommand', apiCommand);
      const httpOptions = { headers: headers };
      this.isCallingAPI.set(true); // Set the signal to true when starting the API call
      const data = await firstValueFrom(this.http.post(this.baseUrl + url, formData, httpOptions)) as IApiData; //call the API and wait for the response
      this.isCallingAPI.set(false); // Set the signal back to false after the API call is complete
      return data;
    } catch (error: HttpErrorResponse | any) {
      this.isCallingAPI.set(false); // Set the signal back to false if there's an error
      return {
        success: false,
        result: null,
        message: 'Error calling the API. Error Message is: ' + error.message
      } as IApiData;
    }
  }


  /**
   * This function will compute the age from the date of birth
   * @param {*} dateString as the date of birth
   * @returns age as a numeral
   */
  computeAgeFromDate(dateString: string): number {
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
   * Check if the logged-in user is an admin
   * @returns boolean If the logged-in user is an admin it returns true, otherwise it returns false
   */
  userIsAdmin(): boolean {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
      const user = JSON.parse(loggedInUser);
      return user.role === 1; // Assuming role 1 is admin
    }
    return false;
  }


  /**
   * Converts the permissions code to a readable string
   * @param {*} code 
   * @returns 
   */
  getDesignationFromCode(code: number): string {
    if (code === 1) {
      return 'ADMIN';
    } else if (code === 2) {
      return 'MANAGER';
    } else if (code === 3) {
      return 'STAFF';
    } else {
      return '-';
    }
  }


}
