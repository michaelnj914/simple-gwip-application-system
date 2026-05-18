import { Routes } from '@angular/router';
import { ApplicationComponent } from './application-component/application-component';
import { UsersComponent } from './dash/users-component/users-component';
import { ApplicationListComponent } from './dash/application-list-component/application-list-component';
import { DashboardComponent } from './dash/dashboard-component/dashboard-component';
import { Auth } from './auth';

export const routes: Routes = [
    {
        path: '', redirectTo: 'home', pathMatch: 'full' //default route for the website will redirect to home
    },
    {
        path: 'home', //URL: "home" will load the home component
        loadComponent: () => import('./home-component/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'login', //URL: "login" will load the login component
        loadComponent: () => import('./login-component/login-component').then(m => m.LoginComponent)
    },
    {
        path: 'application', //URL: "application" will load the application component
        loadComponent: () => import('./application-component/application-component').then(m => m.ApplicationComponent)
    },
    {  // DashboardComponent is a parent component for all the other childcomponents
        path: 'dashboard', component: DashboardComponent, canActivate: [Auth], //url guard to protect the dashboard route
        children: [
                // default route for the dashboard
            { path: '', redirectTo: 'applicationlist', pathMatch: 'full' }, //URL: "dashboard/" will redirect to dashboard/applicationlist
            // default route for the dashboard
            { path: 'applicationlist', component: ApplicationListComponent },//URL: "dashboard/applicationlist" will load the application list component
            // users management page section
            { path: 'users', component: UsersComponent }, // URL: "dashboard/users" will load the users management component
            // application management page section
            { path: 'application', component: ApplicationComponent }, // URL: "dashboard/application" will load the application management component
        ]
    }

];
