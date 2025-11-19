import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Appointment } from '../../models/appointment.model';
import { Observable, of, BehaviorSubject, combineLatest } from 'rxjs';
import { catchError, map, switchMap, shareReplay } from 'rxjs/operators';

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

  private refreshAppointments$ = new BehaviorSubject<void>(undefined);
  selectedFilter$ = new BehaviorSubject<'UPCOMING' | 'CANCELED' | 'PAST'>('UPCOMING');

  appointments$: Observable<Appointment[]> = this.refreshAppointments$.pipe(
    switchMap(() => {
      const decodedToken = this.authService.getDecodedToken();
      if (!decodedToken || typeof decodedToken.id !== 'number') return of([]);
      return this.apiService.getAppointmentsByUserId(decodedToken.id);
    }),
    catchError((error) => {
      console.error('Error fetching appointments:', error);
      return of([]);
    }),
    shareReplay(1)
  );

  filteredAppointments$: Observable<Appointment[]> = combineLatest([
    this.appointments$,
    this.selectedFilter$,
  ]).pipe(
    map(([appointments, filter]) => {
      return appointments.filter((appointment) => {
        const dateTime = this.getAppointmentDateTime(appointment);
        switch (filter) {
          case 'UPCOMING':
            return this.isUpcoming(appointment);
          case 'CANCELED':
            return appointment.stato === 'ANNULLATO';
          case 'PAST':
            return appointment.stato !== 'ANNULLATO' && !!dateTime && dateTime < new Date();
          default:
            return false;
        }
      });
    })
  );

  ngOnInit(): void {
    // Initial fetch triggered by behavior subject
  }

  setFilter(filter: 'UPCOMING' | 'CANCELED' | 'PAST'): void {
    this.selectedFilter$.next(filter);
  }

  cancelAppointment(appointmentId: number): void {
    if (confirm('Sei sicuro di voler cancellare questo appuntamento?')) {
      this.apiService.cancelAppointment(appointmentId).subscribe(
        () => {
          this.refreshAppointments$.next();
        },
        (error) => {
          console.error('Error canceling appointment:', error);
        }
      );
    }
  }

  getAppointmentStatusClass(appointment: Appointment): string {
    return `badge-${appointment.stato?.toLowerCase() ?? 'pending'}`;
  }

  isUpcoming(appointment: Appointment): boolean {
    if (appointment.stato !== 'CONFERMATO') {
      return false;
    }
    const dateTime = this.getAppointmentDateTime(appointment);
    return !!dateTime && dateTime >= new Date();
  }

  private getAppointmentDateTime(appointment: Appointment): Date | null {
    const datePart =
      appointment.data instanceof Date
        ? appointment.data.toISOString().split('T')[0]
        : appointment.data;

    if (!datePart || !appointment.orarioInizio) {
      return null;
    }

    const parsedDate = new Date(`${datePart}T${appointment.orarioInizio}`);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  }
}
