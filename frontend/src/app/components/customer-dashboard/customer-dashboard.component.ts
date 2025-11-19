import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WaitingList } from '../../models/waiting-list.model';
import { Service } from '../../models/service.model';
import { Barber } from '../../models/barber.model';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

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

  private refreshWaitingList$ = new BehaviorSubject<void>(undefined);

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
}

