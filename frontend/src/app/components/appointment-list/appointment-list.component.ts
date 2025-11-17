import { Component, OnInit, inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Appointment } from '../../models/appointment.model';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.css'],
})
export class AppointmentListComponent implements OnInit {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  appointments: Appointment[] = [];
  userId: number | undefined;

  ngOnInit(): void {
    this.userId = this.authService.getDecodedToken()?.id;
    if (this.userId) {
      this.apiService.getAppointmentsByUserId(this.userId).subscribe(
        (data: Appointment[]) => {
          this.appointments = data;
        },
        (error) => {
          console.error('Error fetching appointments', error);
        },
      );
    }
  }
}
