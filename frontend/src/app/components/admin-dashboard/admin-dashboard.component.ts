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

type CalendarDay = {
  date: Date;
  inMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
};

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
  calendarDays: CalendarDay[] = [];
  calendarWeekdays = ['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do'];
  calendarMonthLabel = '';
  private calendarReference: Date = new Date();

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
    this.selectedDate = this.formatDateForInput(today);
    this.loadAppointmentsForDate();
    this.updateCalendar(today);
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
    this.updateCalendar();
  }

  setToday(): void {
    const today = new Date();
    this.selectedDate = this.formatDateForInput(today);
    this.onAgendaDateChange();
    this.updateCalendar(today);
  }

  selectCalendarDay(day: CalendarDay): void {
    this.selectedDate = this.formatDateForInput(day.date);
    this.onAgendaDateChange();
    this.updateCalendar(day.date);
  }

  goToPrevMonth(): void {
    const ref = this.getCalendarReferenceDate();
    const prevMonth = new Date(ref.getFullYear(), ref.getMonth() - 1, 1);
    this.updateCalendar(prevMonth);
  }

  goToNextMonth(): void {
    const ref = this.getCalendarReferenceDate();
    const nextMonth = new Date(ref.getFullYear(), ref.getMonth() + 1, 1);
    this.updateCalendar(nextMonth);
  }

  private getCalendarReferenceDate(): Date {
    return new Date(this.calendarReference.getFullYear(), this.calendarReference.getMonth(), 1);
  }

  private updateCalendar(reference?: Date): void {
    const base = reference ?? this.parseInputDate(this.selectedDate) ?? new Date();
    const startOfMonth = new Date(base.getFullYear(), base.getMonth(), 1);
    const selected = this.parseInputDate(this.selectedDate);
    const today = new Date();

    const startOffset = (startOfMonth.getDay() + 6) % 7; // Monday-first offset
    const daysInMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
    const daysInPrevMonth = new Date(base.getFullYear(), base.getMonth(), 0).getDate();

    const days: CalendarDay[] = [];

    // Leading days from previous month
    for (let i = startOffset - 1; i >= 0; i -= 1) {
      const date = new Date(base.getFullYear(), base.getMonth() - 1, daysInPrevMonth - i);
      days.push({
        date,
        inMonth: false,
        isToday: this.isSameDay(date, today),
        isSelected: selected ? this.isSameDay(date, selected) : false,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(base.getFullYear(), base.getMonth(), day);
      days.push({
        date,
        inMonth: true,
        isToday: this.isSameDay(date, today),
        isSelected: selected ? this.isSameDay(date, selected) : false,
      });
    }

    // Trailing days to complete the last week
    const remaining = days.length % 7 === 0 ? 0 : 7 - (days.length % 7);
    for (let i = 1; i <= remaining; i += 1) {
      const date = new Date(base.getFullYear(), base.getMonth() + 1, i);
      days.push({
        date,
        inMonth: false,
        isToday: this.isSameDay(date, today),
        isSelected: selected ? this.isSameDay(date, selected) : false,
      });
    }

    this.calendarReference = startOfMonth;
    this.calendarMonthLabel = startOfMonth.toLocaleString('it-IT', {
      month: 'long',
      year: 'numeric',
    });
    this.calendarDays = days;
  }

  private isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private parseInputDate(value: string): Date | null {
    if (!value) {
      return null;
    }
    const [year, month, day] = value.split('-').map((part) => Number(part));
    if (!year || !month || !day) {
      return null;
    }
    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? null : date;
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
