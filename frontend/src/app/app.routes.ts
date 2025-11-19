import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'admin-dashboard',
    loadComponent: () =>
      import('./components/admin-dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent
      ),
    canActivate: [adminGuard],
  },
  {
    path: 'customer-dashboard',
    loadComponent: () =>
      import('./components/customer-dashboard/customer-dashboard.component').then(
        (m) => m.CustomerDashboardComponent
      ),
  },
  {
    path: 'book',
    loadComponent: () =>
      import('./components/service-booking/service-booking.component').then(
        (m) => m.ServiceBookingComponent
      ),
  },
  {
    path: 'appointments',
    loadComponent: () =>
      import('./components/appointment-list/appointment-list.component').then(
        (m) => m.AppointmentListComponent
      ),
  },
];

