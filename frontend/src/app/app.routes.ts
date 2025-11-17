import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { CustomerDashboardComponent } from './components/customer-dashboard/customer-dashboard.component';
import { ServiceBookingComponent } from './components/service-booking/service-booking.component';
import { AppointmentListComponent } from './components/appointment-list/appointment-list.component';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'customer-dashboard', component: CustomerDashboardComponent },
  { path: 'book', component: ServiceBookingComponent },
  { path: 'appointments', component: AppointmentListComponent },
];
