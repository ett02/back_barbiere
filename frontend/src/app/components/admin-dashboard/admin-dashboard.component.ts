import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
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
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { BarberAdminService } from '../../services/barber-admin.service';

type AdminSection = 'services' | 'barbers' | 'agenda' | 'settings' | 'waitingList';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent implements OnInit {
  private apiService = inject(ApiService);
  private barberAdminService = inject(BarberAdminService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // State Management with BehaviorSubjects
  private refreshServices$ = new BehaviorSubject<void>(undefined);
  private refreshBarbers$ = new BehaviorSubject<void>(undefined);
  private refreshBusinessHours$ = new BehaviorSubject<void>(undefined);
  private selectedDate$ = new BehaviorSubject<string>('');

  // Waiting List State
  private selectedWaitingListDate$ = new BehaviorSubject<string>('');
  waitingListServiceFilter: number | null = null;
  waitingListStatusFilter: 'ALL' | 'IN_ATTESA' | 'CONFERMATO' | 'ANNULLATO' = 'ALL';

  // Observables for template
  services$: Observable<Service[]> = this.refreshServices$.pipe(
    switchMap(() => this.apiService.getAllServices()),
    catchError((error) => {
      console.error('Errore caricamento servizi:', error);
      return of([]);
    })
  );

  barbers$: Observable<Barber[]> = this.refreshBarbers$.pipe(
    switchMap(() => this.apiService.getAllBarbers()),
    catchError((error) => {
      console.error('Errore caricamento barbieri:', error);
      return of([]);
    })
  );

  businessHours$: Observable<BusinessHours[]> = this.refreshBusinessHours$.pipe(
    switchMap(() => this.apiService.getBusinessHours()),
    map((data) =>
      data
        .sort((a, b) => a.giorno - b.giorno)
        .map((hour) => ({
          ...hour,
          apertura: hour.apertura ? hour.apertura.substring(0, 5) : null,
          chiusura: hour.chiusura ? hour.chiusura.substring(0, 5) : null,
        }))
    ),
    catchError((error) => {
      this.handleUnauthorized(error);
      console.error('Errore caricamento orari:', error);
      return of([]);
    })
  );

  appointments$: Observable<Appointment[]> = this.selectedDate$.pipe(
    switchMap((date) => {
      if (!date) return of([]);
      return this.apiService.getAppointmentsByDate(date).pipe(
        map((data) =>
          [...data].sort((a, b) => {
            const timeA = this.formatTimeValue(a.orarioInizio);
            const timeB = this.formatTimeValue(b.orarioInizio);
            return timeA.localeCompare(timeB);
          })
        ),
        catchError((error) => {
          this.handleUnauthorized(error);
          console.error('Errore caricamento appuntamenti:', error);
          return of([]);
        })
      );
    })
  );

  waitingList$: Observable<any[]> = combineLatest([
    this.selectedWaitingListDate$,
    this.services$ // We need services to filter by service if needed, but mainly to trigger updates if services change? No, just for the dropdown.
  ]).pipe(
    switchMap(([date]) => {
      if (!date) return of([]);
      return this.barberAdminService.getWaitingListByDate(date).pipe(
        catchError((error) => {
          console.error('Errore caricamento lista attesa:', error);
          return of([]);
        })
      );
    })
  );

  selectedSection: AdminSection = 'agenda';

  // Calendar State
  calendarDays: CalendarDay[] = [];
  calendarWeekdays = ['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do'];
  calendarMonthLabel = '';
  private calendarReference: Date = new Date();

  // Waiting List Calendar State (can reuse logic but need separate state if we want independent calendars)
  // For simplicity, let's reuse the logic but store the selected date separately.
  // We might need a separate calendar instance if we want to navigate months independently.
  // Let's assume we use the same calendar logic but applied to a different view.
  // Actually, to avoid conflict, let's duplicate the calendar state for waiting list or just reset it when switching tabs.
  // Resetting when switching tabs is easier.

  // Forms State
  newService: Partial<Service> = { nome: '', durata: 0, prezzo: 0, descrizione: '' };
  editingService: Service | null = null;

  newBarber: Partial<Barber> = { nome: '', cognome: '', esperienza: '', specialita: '' };
  editingBarber: Barber | null = null;
  editingBarberServiceIds: Set<number> | null = null;
  servicesDropdownOpen = false;

  isSavingBusinessHours = false;
  businessHoursMessage = '';

  readonly dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

  isSidebarOpen = false;

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  ngOnInit(): void {
    if (!this.authService.isAdminAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.initializeAgenda();
    this.initializeWaitingList();
  }

  setSection(section: AdminSection): void {
    this.selectedSection = section;
    if (section === 'agenda') {
      this.updateCalendar(this.parseInputDate(this.selectedDate) || new Date());
    } else if (section === 'waitingList') {
      this.updateCalendar(this.parseInputDate(this.selectedWaitingListDate) || new Date());
    }
  }

  // --- Agenda Logic ---

  private initializeAgenda(): void {
    const today = new Date();
    this.updateSelectedDate(this.formatDateForInput(today));
    this.updateCalendar(today);
  }

  updateSelectedDate(date: string): void {
    this.selectedDate$.next(date);
  }

  get selectedDate(): string {
    return this.selectedDate$.value;
  }

  set selectedDate(value: string) {
    this.selectedDate$.next(value);
  }

  onAgendaDateChange(): void {
    this.updateCalendar();
  }

  setToday(): void {
    const today = new Date();
    this.selectedDate = this.formatDateForInput(today);
    this.updateCalendar(today);
  }

  // --- Waiting List Logic ---

  private initializeWaitingList(): void {
    const today = new Date();
    this.selectedWaitingListDate = this.formatDateForInput(today);
  }

  get selectedWaitingListDate(): string {
    return this.selectedWaitingListDate$.value;
  }

  set selectedWaitingListDate(value: string) {
    this.selectedWaitingListDate$.next(value);
  }

  onWaitingListDateChange(): void {
    this.updateCalendar();
  }

  setTodayWaitingList(): void {
    const today = new Date();
    this.selectedWaitingListDate = this.formatDateForInput(today);
    this.updateCalendar(today);
  }

  getFilteredWaitingList(list: any[]): any[] {
    return list.filter(item => {
      const matchesService = this.waitingListServiceFilter ? item.service.id === this.waitingListServiceFilter : true;
      const matchesStatus = this.waitingListStatusFilter === 'ALL' ? true : item.stato === this.waitingListStatusFilter;
      return matchesService && matchesStatus;
    });
  }

  setWaitingListStatusFilter(status: 'ALL' | 'IN_ATTESA' | 'CONFERMATO' | 'ANNULLATO'): void {
    this.waitingListStatusFilter = status;
  }

  // --- Calendar Logic (Shared) ---

  selectCalendarDay(day: CalendarDay): void {
    if (this.selectedSection === 'agenda') {
      this.selectedDate = this.formatDateForInput(day.date);
    } else if (this.selectedSection === 'waitingList') {
      this.selectedWaitingListDate = this.formatDateForInput(day.date);
    }
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
    let selectedDateStr = this.selectedSection === 'waitingList' ? this.selectedWaitingListDate : this.selectedDate;

    const base = reference ?? this.parseInputDate(selectedDateStr) ?? new Date();
    const startOfMonth = new Date(base.getFullYear(), base.getMonth(), 1);
    const selected = this.parseInputDate(selectedDateStr);
    const today = new Date();

    const startOffset = (startOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
    const daysInPrevMonth = new Date(base.getFullYear(), base.getMonth(), 0).getDate();

    const days: CalendarDay[] = [];

    for (let i = startOffset - 1; i >= 0; i -= 1) {
      const date = new Date(base.getFullYear(), base.getMonth() - 1, daysInPrevMonth - i);
      days.push({
        date,
        inMonth: false,
        isToday: this.isSameDay(date, today),
        isSelected: selected ? this.isSameDay(date, selected) : false,
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(base.getFullYear(), base.getMonth(), day);
      days.push({
        date,
        inMonth: true,
        isToday: this.isSameDay(date, today),
        isSelected: selected ? this.isSameDay(date, selected) : false,
      });
    }

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
    this.calendarMonthLabel = startOfMonth.toLocaleString('it-IT', { month: 'long', year: 'numeric' });
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
    if (!value) return null;
    const [year, month, day] = value.split('-').map((part) => Number(part));
    if (!year || !month || !day) return null;
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
    if (normalized.includes('confer')) return 'status-confirmed';
    if (normalized.includes('complet')) return 'status-completed';
    if (normalized.includes('annull') || normalized.includes('cancel')) return 'status-cancelled';
    if (normalized.includes('pend') || normalized.includes('attesa')) return 'status-pending';
    return 'status-default';
  }

  // --- Service Management ---

  startEditService(service: Service): void {
    this.editingService = { ...service };
  }

  cancelEditService(): void {
    this.editingService = null;
  }

  saveService(): void {
    if (!this.editingService) return;

    this.apiService.updateService(this.editingService.id, this.editingService).subscribe({
      next: () => {
        this.refreshServices$.next();
        this.editingService = null;
      },
      error: (error) => console.error('Errore aggiornamento servizio:', error),
    });
  }

  createService(): void {
    if (!this.newService.nome || !this.newService.descrizione) return;

    const payload = {
      ...this.newService,
      durata: Number(this.newService.durata) || 0,
      prezzo: Number(this.newService.prezzo) || 0,
    };

    this.apiService.createService(payload).subscribe({
      next: () => {
        this.refreshServices$.next();
        this.newService = { nome: '', durata: 0, prezzo: 0, descrizione: '' };
      },
      error: (error) => console.error('Errore creazione servizio:', error),
    });
  }

  deleteService(id: number | undefined): void {
    if (!id) return;
    this.apiService.deleteService(id).subscribe({
      next: () => this.refreshServices$.next(),
      error: (error) => console.error('Errore eliminazione servizio:', error),
    });
  }

  // --- Barber Management ---

  startEditBarber(barber: Barber): void {
    this.editingBarber = { ...barber };
    this.editingBarberServiceIds = new Set<number>();
    this.servicesDropdownOpen = true;

    if (barber.id) {
      this.apiService.getServicesForBarber(barber.id).subscribe({
        next: (services) => {
          this.editingBarberServiceIds = new Set(services.map((s) => s.id!));
        },
        error: (error) => console.error('Errore caricamento servizi barbiere:', error),
      });
    }
  }

  cancelEditBarber(): void {
    this.editingBarber = null;
    this.editingBarberServiceIds = null;
    this.servicesDropdownOpen = false;
  }

  saveBarber(): void {
    if (!this.editingBarber) return;

    this.apiService.updateBarber(this.editingBarber.id, this.editingBarber).subscribe({
      next: () => {
        if (this.editingBarberServiceIds && this.editingBarber?.id) {
          const serviceIds = Array.from(this.editingBarberServiceIds);
          this.apiService.updateBarberServices(this.editingBarber.id, serviceIds).subscribe({
            next: () => {
              this.refreshBarbers$.next();
              this.cancelEditBarber();
            },
            error: (error) => console.error('Errore aggiornamento servizi barbiere:', error),
          });
        } else {
          this.refreshBarbers$.next();
          this.cancelEditBarber();
        }
      },
      error: (error) => console.error('Errore aggiornamento barbiere:', error),
    });
  }

  createBarber(): void {
    if (!this.newBarber.nome || !this.newBarber.cognome) return;

    this.apiService.createBarber(this.newBarber).subscribe({
      next: () => {
        this.refreshBarbers$.next();
        this.newBarber = { nome: '', cognome: '', esperienza: '', specialita: '' };
      },
      error: (error) => console.error('Errore creazione barbiere:', error),
    });
  }

  deleteBarber(id: number | undefined): void {
    if (!id) return;
    this.apiService.deleteBarber(id).subscribe({
      next: () => this.refreshBarbers$.next(),
      error: (error) => console.error('Errore eliminazione barbiere:', error),
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

  // --- Business Hours Management ---

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

  saveBusinessHours(currentHours: BusinessHours[]): void {
    this.isSavingBusinessHours = true;
    this.businessHoursMessage = '';

    const payload = currentHours.map((hour) => ({
      ...hour,
      apertura: hour.aperto ? this.formatTimeForApi(hour.apertura) : null,
      chiusura: hour.aperto ? this.formatTimeForApi(hour.chiusura) : null,
    }));

    this.apiService.updateBusinessHours(payload).subscribe({
      next: () => {
        this.refreshBusinessHours$.next();
        this.businessHoursMessage = 'Orari di apertura aggiornati con successo.';
        this.isSavingBusinessHours = false;
      },
      error: (error) => {
        if (this.handleUnauthorized(error)) {
          this.businessHoursMessage = 'Sessione scaduta. Effettua di nuovo l\'accesso.';
          this.isSavingBusinessHours = false;
          return;
        }
        console.error('Errore salvataggio orari:', error);
        this.businessHoursMessage = 'Impossibile aggiornare gli orari.';
        this.isSavingBusinessHours = false;
      },
    });
  }

  getDayName(day: number): string {
    return this.dayNames[day] || '';
  }

  private formatTimeForApi(time: string | null): string | null {
    if (!time) return null;
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
