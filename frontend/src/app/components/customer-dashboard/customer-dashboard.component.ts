import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Appointment } from '../../models/appointment.model';
import { WaitingList } from '../../models/waiting-list.model';
import { Service } from '../../models/service.model';
import { Barber } from '../../models/barber.model';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { catchError, map, switchMap, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerDashboardComponent implements OnInit {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private router = inject(Router);

  customerName = 'Cliente';

  private refreshAppointments$ = new BehaviorSubject<void>(undefined);
  private refreshWaitingList$ = new BehaviorSubject<void>(undefined);
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

  waitingList$: Observable<WaitingList[]> = this.refreshWaitingList$.pipe(
    switchMap(() => {
      const decodedToken = this.authService.getDecodedToken();
      if (!decodedToken || typeof decodedToken.id !== 'number') return of([]);
      return this.apiService.getWaitingListByCustomerId(decodedToken.id);
    }),
    catchError((error) => {
      console.error('Error fetching waiting list:', error);
      return of([]);
    })
  );

  ngOnInit(): void {
    // Get customer name from JWT token
    const decodedToken = this.authService.getDecodedToken();
    if (decodedToken && decodedToken.sub) {
      // Extract name from email (before @)
      this.customerName = decodedToken.sub.split('@')[0];
    }
  }

  navigateToBooking(): void {
    this.router.navigate(['/book']);
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

  removeFromWaitingList(waitingId: number): void {
    if (confirm("Vuoi rimuoverti dalla lista d'attesa?")) {
      this.apiService.removeFromWaitingList(waitingId).subscribe(
        () => {
          this.refreshWaitingList$.next();
        },
        (error) => {
          console.error('Error removing from waiting list:', error);
        }
      );
    }
  }

  getServiceName(service?: Service | null): string {
    return service?.nome ?? 'Servizio';
  }

  getServiceDuration(service?: Service | null): string {
    return service?.durata != null ? `${service.durata} min` : '--';
  }

  getAppointmentStatusClass(appointment: Appointment): string {
    return `badge-${appointment.stato?.toLowerCase() ?? 'pending'}`;
  }

  getBarberFullName(barber?: Barber | null): string {
    if (!barber) {
      return 'Non assegnato';
    }
    const parts = [barber.nome, barber.cognome].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'Non assegnato';
  }

  getWaitingStatusMessage(waiting: WaitingList): string {
    switch (waiting.stato) {
      case 'IN_ATTESA':
        return 'In attesa di disponibilità';
      case 'NOTIFICATO':
        return 'Hai ricevuto una notifica di disponibilità';
      case 'CONFERMATO':
        return 'Appuntamento confermato';
      case 'SCADUTO':
        return 'La richiesta è scaduta';
      case 'ANNULLATO':
        return 'Richiesta annullata';
      default:
        return 'Stato non disponibile';
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  setFilter(filter: 'UPCOMING' | 'CANCELED' | 'PAST'): void {
    this.selectedFilter$.next(filter);
  }

  isUpcoming(appointment: Appointment): boolean {
    if (appointment.stato !== 'CONFERMATO') {
      return false;
    }
    const dateTime = this.getAppointmentDateTime(appointment);
    return !!dateTime && dateTime >= new Date();
  }

  getCurrentFilterMessage(filter: string | null): string {
    switch (filter) {
      case 'UPCOMING':
        return 'Mostro solo gli appuntamenti confermati da svolgere';
      case 'CANCELED':
        return 'Mostro gli appuntamenti annullati';
      case 'PAST':
        return 'Mostro gli appuntamenti già passati';
      default:
        return '';
    }
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

