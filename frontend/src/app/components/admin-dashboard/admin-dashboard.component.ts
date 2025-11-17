import { Component, OnInit, inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Service } from '../../models/service.model';
import { Barber } from '../../models/barber.model';
import { Appointment } from '../../models/appointment.model';
import { BusinessHours } from '../../models/business-hours.model';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

type AdminSection = 'services' | 'barbers' | 'agenda' | 'settings';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private router = inject(Router);

  services: Service[] = [];
  barbers: Barber[] = [];
  appointments: Appointment[] = [];
  businessHours: BusinessHours[] = [];

  selectedSection: AdminSection = 'agenda';
  selectedDate = '';

  newService: Partial<Service> = {
    nome: '',
    durata: 0,
    prezzo: 0,
    descrizione: '',
  };

  editingService: Service | null = null;

  newBarber: Partial<Barber> = {
    nome: '',
    cognome: '',
    esperienza: '',
    specialita: '',
  };

  editingBarber: Barber | null = null;
  editingBarberServiceIds: Set<number> | null = null;
  servicesDropdownOpen = false;

  isSavingBusinessHours = false;
  businessHoursMessage = '';

  readonly dayNames = [
    'Domenica',
    'Lunedì',
    'Martedì',
    'Mercoledì',
    'Giovedì',
    'Venerdì',
    'Sabato',
  ];

  ngOnInit(): void {
    if (!this.authService.isAdminAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadServices();
    this.loadBarbers();
    this.loadBusinessHours();
    this.initializeAgenda();
  }

  setSection(section: AdminSection): void {
    this.selectedSection = section;
  }

  private initializeAgenda(): void {
    const today = new Date();
    this.selectedDate = today.toISOString().split('T')[0];
    this.loadAppointmentsForDate();
  }

  loadServices(): void {
    this.apiService.getAllServices().subscribe({
      next: (data) => {
        this.services = data;
      },
      error: (error) => console.error('Errore durante il caricamento dei servizi:', error),
    });
  }

  startEditService(service: Service): void {
    this.editingService = { ...service };
  }

  cancelEditService(): void {
    this.editingService = null;
  }

  saveService(): void {
    if (!this.editingService) {
      return;
    }

    this.apiService.updateService(this.editingService.id, this.editingService).subscribe({
      next: () => {
        this.loadServices();
        this.editingService = null;
      },
      error: (error) => console.error('Errore durante l\'aggiornamento del servizio:', error),
    });
  }

  createService(): void {
    if (!this.newService.nome || !this.newService.descrizione) {
      return;
    }

    const payload = {
      ...this.newService,
      durata: Number(this.newService.durata) || 0,
      prezzo: Number(this.newService.prezzo) || 0,
    };

    this.apiService.createService(payload).subscribe({
      next: () => {
        this.loadServices();
        this.newService = { nome: '', durata: 0, prezzo: 0, descrizione: '' };
      },
      error: (error) => console.error('Errore durante la creazione del servizio:', error),
    });
  }

  deleteService(id: number | undefined): void {
    if (!id) {
      return;
    }

    this.apiService.deleteService(id).subscribe({
      next: () => this.loadServices(),
      error: (error) => console.error('Errore durante l\'eliminazione del servizio:', error),
    });
  }

  loadBarbers(): void {
    this.apiService.getAllBarbers().subscribe({
      next: (data) => {
        this.barbers = data;
      },
      error: (error) => console.error('Errore durante il caricamento dei barbieri:', error),
    });
  }

  startEditBarber(barber: Barber): void {
    this.editingBarber = { ...barber };
    this.editingBarberServiceIds = new Set<number>();
    this.servicesDropdownOpen = true;

    if (barber.id) {
      this.apiService.getServicesForBarber(barber.id).subscribe({
        next: (services) => {
          this.editingBarberServiceIds = new Set(services.map((s) => s.id!));
        },
        error: (error) => console.error('Errore nel caricamento dei servizi del barbiere:', error),
      });
    }
  }

  cancelEditBarber(): void {
    this.editingBarber = null;
    this.editingBarberServiceIds = null;
    this.servicesDropdownOpen = false;
  }

  saveBarber(): void {
    if (!this.editingBarber) {
      return;
    }

    this.apiService.updateBarber(this.editingBarber.id, this.editingBarber).subscribe({
      next: () => {
        if (this.editingBarberServiceIds && this.editingBarber?.id) {
          const serviceIds = Array.from(this.editingBarberServiceIds);
          this.apiService.updateBarberServices(this.editingBarber.id, serviceIds).subscribe({
            next: () => {
              this.loadBarbers();
              this.editingBarber = null;
              this.editingBarberServiceIds = null;
              this.servicesDropdownOpen = false;
            },
            error: (error) => console.error('Errore durante l\'aggiornamento dei servizi del barbiere:', error),
          });
        } else {
          this.loadBarbers();
          this.editingBarber = null;
          this.editingBarberServiceIds = null;
          this.servicesDropdownOpen = false;
        }
      },
      error: (error) => console.error('Errore durante l\'aggiornamento del barbiere:', error),
    });
  }

  createBarber(): void {
    if (!this.newBarber.nome || !this.newBarber.cognome) {
      return;
    }

    this.apiService.createBarber(this.newBarber).subscribe({
      next: () => {
        this.loadBarbers();
        this.newBarber = { nome: '', cognome: '', esperienza: '', specialita: '' };
      },
      error: (error) => console.error('Errore durante la creazione del barbiere:', error),
    });
  }

  deleteBarber(id: number | undefined): void {
    if (!id) {
      return;
    }

    this.apiService.deleteBarber(id).subscribe({
      next: () => this.loadBarbers(),
      error: (error) => console.error('Errore durante l\'eliminazione del barbiere:', error),
    });
  }

  toggleServiceForEditingBarber(serviceId: number, checked: boolean): void {
    if (!this.editingBarberServiceIds) {
      this.editingBarberServiceIds = new Set<number>();
    }

    if (checked) {
      this.editingBarberServiceIds.add(serviceId);
    } else {
      this.editingBarberServiceIds.delete(serviceId);
    }
  }

  toggleServicesDropdown(): void {
    this.servicesDropdownOpen = !this.servicesDropdownOpen;
  }

  loadAppointmentsForDate(): void {
    if (!this.selectedDate) {
      return;
    }

    this.apiService.getAppointmentsByDate(this.selectedDate).subscribe({
      next: (data) => {
        this.appointments = [...data].sort((a, b) => {
          const timeA = this.formatTimeValue(a.orarioInizio);
          const timeB = this.formatTimeValue(b.orarioInizio);
          return timeA.localeCompare(timeB);
        });
      },
      error: (error) => {
        if (this.handleUnauthorized(error)) {
          return;
        }
        console.error('Errore durante il caricamento degli appuntamenti:', error);
      },
    });
  }

  onAgendaDateChange(): void {
    this.loadAppointmentsForDate();
  }

  private formatTimeValue(time: string): string {
    return time ? time.substring(0, 5) : '';
  }

  formatTime(time: string): string {
    return this.formatTimeValue(time);
  }

  getAppointmentStatusClass(status: string | undefined): string {
    const normalized = (status || '').toLowerCase();

    if (normalized.includes('confer')) {
      return 'status-confirmed';
    }

    if (normalized.includes('complet')) {
      return 'status-completed';
    }

    if (normalized.includes('annull') || normalized.includes('cancel')) {
      return 'status-cancelled';
    }

    if (normalized.includes('pend') || normalized.includes('attesa')) {
      return 'status-pending';
    }

    return 'status-default';
  }

  loadBusinessHours(): void {
    this.apiService.getBusinessHours().subscribe({
      next: (data) => {
        this.businessHours = data
          .sort((a, b) => a.giorno - b.giorno)
          .map((hour) => ({
            ...hour,
            apertura: hour.apertura ? hour.apertura.substring(0, 5) : null,
            chiusura: hour.chiusura ? hour.chiusura.substring(0, 5) : null,
          }));
      },
      error: (error) => {
        if (this.handleUnauthorized(error)) {
          return;
        }
        console.error('Errore durante il caricamento degli orari:', error);
      },
    });
  }

  toggleDayOpen(hours: BusinessHours): void {
    hours.aperto = !hours.aperto;
    if (!hours.aperto) {
      hours.apertura = null;
      hours.chiusura = null;
    } else {
      hours.apertura = hours.apertura ?? '09:00';
      hours.chiusura = hours.chiusura ?? '19:00';
    }
  }

  saveBusinessHours(): void {
    this.isSavingBusinessHours = true;
    this.businessHoursMessage = '';

    const payload = this.businessHours.map((hour) => ({
      ...hour,
      apertura: hour.aperto ? this.formatTimeForApi(hour.apertura) : null,
      chiusura: hour.aperto ? this.formatTimeForApi(hour.chiusura) : null,
    }));

    this.apiService.updateBusinessHours(payload).subscribe({
      next: (data) => {
        this.businessHours = data
          .sort((a, b) => a.giorno - b.giorno)
          .map((hour) => ({
            ...hour,
            apertura: hour.apertura ? hour.apertura.substring(0, 5) : null,
            chiusura: hour.chiusura ? hour.chiusura.substring(0, 5) : null,
          }));
        this.businessHoursMessage = 'Orari di apertura aggiornati con successo.';
        this.isSavingBusinessHours = false;
      },
      error: (error) => {
        if (this.handleUnauthorized(error)) {
          this.businessHoursMessage = 'Sessione scaduta. Effettua di nuovo l\'accesso per modificare gli orari.';
          this.isSavingBusinessHours = false;
          return;
        }
        console.error('Errore durante il salvataggio degli orari:', error);
        this.businessHoursMessage = 'Impossibile aggiornare gli orari. Riprova più tardi.';
        this.isSavingBusinessHours = false;
      },
    });
  }

  getDayName(day: number): string {
    return this.dayNames[day] || '';
  }

  private formatTimeForApi(time: string | null): string | null {
    if (!time) {
      return null;
    }
    return time.length === 5 ? `${time}:00` : time;
  }

  private handleUnauthorized(error: unknown): boolean {
    if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) {
      this.authService.logout();
      this.router.navigate(['/login']);
      return true;
    }
    return false;
  }
}
