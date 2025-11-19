import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Appointment } from '../../models/appointment.model';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentListComponent implements OnInit {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  appointments$: Observable<Appointment[]> = of([]);

  ngOnInit(): void {
    const userId = this.authService.getDecodedToken()?.id;
    if (userId) {
      this.appointments$ = this.apiService.getAppointmentsByUserId(userId);
    }
  }
}
