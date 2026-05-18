import { Injectable } from '@angular/core';


@Injectable({
    providedIn: 'root'
})
export class Auth { // This is a route guard to protect the dashboard route and its child routes

    canActivate() {
        const usr: any = localStorage.getItem('loggedInUser');//This was cached when we logged in
        if (usr === null) {
            return false;
        }
        //convert the stringified JSON object back to a JavaScript object
        const loggedInUser = JSON.parse(usr);
        if (+loggedInUser.role === 1) {  //only admin can access the dashboard and users page
            return true;
        } else {

            return false;
        }
    }
}