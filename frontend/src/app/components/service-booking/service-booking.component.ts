import { Component, OnInit, inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Service } from '../../models/service.model';
import { Barber } from '../../models/barber.model';
import { AvailableSlot } from '../../models/available-slot.model';
import { BusinessHours } from '../../models/business-hours.model';

interface CalendarDay {
  isoDate?: string;
  label?: number;
  isPlaceholder?: boolean;
  isToday?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  isClosed?: boolean;
}

interface CalendarMonth {
  label: string;
  month: number;
  year: number;
  days: CalendarDay[];
}

@Component({
  selector: 'app-service-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './service-booking.component.html',
  styleUrls: ['./service-booking.component.css'],
})
export class ServiceBookingComponent implements OnInit {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private router = inject(Router);

  currentStep = 1;
  services: Service[] = [];
  barbers: Barber[] = [];
  availableSlots: AvailableSlot[] = [];
  businessHours: BusinessHours[] = [];
  businessHoursMap = new Map<number, BusinessHours>();
  calendarMonths: CalendarMonth[] = [];
  activeMonthIndex = 0;

  selectedService: Service | null = null;
  selectedBarber: Barber | null = null;
  selectedDate = '';
  selectedTime = '';

  minDate = '';
  isLoadingSlots = false;
  bookingError = '';
  isLoadingBusinessHours = false;
  businessHoursError = '';

  get isSummaryVisible(): boolean {
    return (
      this.currentStep === 4 &&
      !!this.selectedService &&
      !!this.selectedBarber &&
      !!this.selectedDate &&
      !!this.selectedTime
    );
  }

  readonly weekdayLabels = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
  readonly monthLabels = [
    'Gennaio',
    'Febbraio',
    'Marzo',
    'Aprile',
    'Maggio',
    'Giugno',
    'Luglio',
    'Agosto',
    'Settembre',
    'Ottobre',
    'Novembre',
    'Dicembre',
  ];

  ngOnInit(): void {
    // Set minimum date to today
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    this.loadBusinessHours();

    // Check if service was passed from customer dashboard
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state?.['service']) {
      this.selectedService = navigation.extras.state['service'];
      this.currentStep = 2;
      this.loadBarbers();
    } else {
      this.loadServices();
    }
  }

  loadServices(): void {
    this.apiService.getAllServices().subscribe({
      next: (data) => {
        this.services = data;
      },
      error: (error) => {
        console.error('Error loading services:', error);
      },
    });
  }

  loadBarbers(): void {
    if (this.selectedService) {
      this.apiService.getBarbersForService(this.selectedService.id!).subscribe({
        next: (data) => {
          this.barbers = data;
        },
        error: (error) => {
          console.error('Errore durante il caricamento dei barbieri:', error);
        },
      });
    }
  }

  loadAvailableSlots(): void {
    if (this.selectedBarber && this.selectedService && this.selectedDate) {
      this.isLoadingSlots = true;
      this.availableSlots = [];
      this.apiService
        .getAvailableSlots(this.selectedBarber.id!, this.selectedService.id!, this.selectedDate)
        .subscribe({
          next: (data) => {
            this.availableSlots = data;
            this.isLoadingSlots = false;
          },
          error: (error) => {
            console.error('Errore durante il caricamento delle disponibilità:', error);
            this.isLoadingSlots = false;
          },
        });
    }
  }

  selectService(service: Service): void {
    this.selectedService = service;
    this.selectedBarber = null;
    this.selectedDate = '';
    this.selectedTime = '';
    this.availableSlots = [];
    this.bookingError = '';
    this.currentStep = 2;
    this.loadBarbers();
    this.activeMonthIndex = 0;
    this.refreshCalendar();
  }

  selectBarber(barber: Barber): void {
    this.selectedBarber = barber;
    this.selectedDate = '';
    this.selectedTime = '';
    this.availableSlots = [];
    this.bookingError = '';
    this.currentStep = 3;
    this.activeMonthIndex = 0;
    this.refreshCalendar();
  }

  selectCalendarDay(day: CalendarDay): void {
    if (!day.isoDate || day.isDisabled) {
      return;
    }

    if (this.selectedDate !== day.isoDate) {
      this.selectedDate = day.isoDate;
      this.selectedTime = '';
      this.availableSlots = [];
      this.bookingError = '';
      this.updateCalendarSelection();
      this.loadAvailableSlots();
    }

    this.currentStep = 4;
  }

  selectTimeSlot(slot: AvailableSlot): void {
    if (slot.available) {
      this.selectedTime = this.formatTime(slot.orarioInizio);
      this.bookingError = '';
    }
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1:
        return !!this.selectedService;
      case 2:
        return !!this.selectedBarber;
      case 3:
        return !!this.selectedDate;
      case 4:
        return !!this.selectedTime;
      default:
        return false;
    }
  }

  nextStep(): void {
    if (this.currentStep < 4) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  handleBack(): void {
    if (this.isSummaryVisible) {
      this.selectedTime = '';
      return;
    }

    if (this.currentStep > 1) {
      this.previousStep();
      return;
    }

    this.router.navigate(['/customer-dashboard']);
  }

  confirmBooking(): void {
    const decodedToken = this.authService.getDecodedToken();
    if (decodedToken && this.selectedBarber && this.selectedService) {
      const appointmentData = {
        customerId: decodedToken.id,
        barberId: this.selectedBarber.id,
        serviceId: this.selectedService.id,
        data: this.selectedDate,
        orarioInizio: this.formatTimeForApi(this.selectedTime),
      };

      this.bookingError = '';

      this.apiService.createAppointment(appointmentData).subscribe({
        next: () => {
          alert('Prenotazione confermata!');
          this.router.navigate(['/customer-dashboard']);
        },
        error: (error) => {
          console.error('Errore durante la creazione della prenotazione:', error);
          this.bookingError =
            error?.error?.message || 'Si è verificato un errore durante la conferma della prenotazione.';
        },
      });
    }
  }

  formatTime(time: string): string {
    return time ? time.substring(0, 5) : '';
  }

  private formatTimeForApi(time: string): string {
    return time.length === 5 ? `${time}:00` : time;
  }

  private loadBusinessHours(): void {
    this.isLoadingBusinessHours = true;
    this.businessHoursError = '';

    this.apiService.getBusinessHours().subscribe({
      next: (data) => {
        this.businessHours = data;
        this.businessHoursMap = new Map(data.map((hour) => [hour.giorno, hour]));
        this.isLoadingBusinessHours = false;
        this.activeMonthIndex = 0;
        this.refreshCalendar();
      },
      error: (error) => {
        console.error('Errore durante il caricamento degli orari di apertura:', error);
        this.businessHoursError =
          'Impossibile caricare gli orari del salone. Riprova più tardi.';
        this.isLoadingBusinessHours = false;
      },
    });
  }

  private refreshCalendar(): void {
    if (!this.businessHours.length || !this.minDate) {
      this.calendarMonths = [];
      return;
    }

    this.generateCalendarMonths();
    this.updateCalendarSelection();
  }

  private generateCalendarMonths(monthCount = 3): void {
    const startDate = this.parseIsoDate(this.minDate);
    if (!startDate) {
      this.calendarMonths = [];
      return;
    }

    const months: CalendarMonth[] = [];

    for (let offset = 0; offset < monthCount; offset++) {
      const baseDate = new Date(startDate.getFullYear(), startDate.getMonth() + offset, 1);
      const totalDays = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0).getDate();

      const days: CalendarDay[] = [];
      const leadingPlaceholders = this.getMondayBasedWeekday(baseDate);
      for (let i = 0; i < leadingPlaceholders; i++) {
        days.push({ isPlaceholder: true });
      }

      for (let day = 1; day <= totalDays; day++) {
        const date = new Date(baseDate.getFullYear(), baseDate.getMonth(), day);
        const isoDate = this.toIsoDate(date);
        const weekday = date.getDay();
        const businessHour = this.businessHoursMap.get(weekday);
        const isClosed = !businessHour || !businessHour.aperto;
        const isBeforeMin = isoDate < this.minDate;

        days.push({
          isoDate,
          label: day,
          isPlaceholder: false,
          isToday: isoDate === this.minDate,
          isSelected: isoDate === this.selectedDate,
          isDisabled: isBeforeMin || isClosed,
          isClosed,
        });
      }

      months.push({
        label: `${this.monthLabels[baseDate.getMonth()]} ${baseDate.getFullYear()}`,
        month: baseDate.getMonth(),
        year: baseDate.getFullYear(),
        days,
      });
    }

    this.calendarMonths = months;

    if (this.activeMonthIndex >= this.calendarMonths.length) {
      this.activeMonthIndex = this.calendarMonths.length - 1;
    }
    if (this.activeMonthIndex < 0) {
      this.activeMonthIndex = 0;
    }
  }

  previousMonth(): void {
    if (this.activeMonthIndex > 0) {
      this.activeMonthIndex--;
    }
  }

  nextMonth(): void {
    if (this.activeMonthIndex < this.calendarMonths.length - 1) {
      this.activeMonthIndex++;
    }
  }

  private updateCalendarSelection(): void {
    this.calendarMonths = this.calendarMonths.map((month) => ({
      ...month,
      days: month.days.map((day) => ({
        ...day,
        isSelected: !!day.isoDate && day.isoDate === this.selectedDate,
      })),
    }));
  }

  private parseIsoDate(value: string): Date | null {
    if (!value) {
      return null;
    }
    const parts = value.split('-').map(Number);
    if (parts.length !== 3) {
      return null;
    }
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getMondayBasedWeekday(date: Date): number {
    return (date.getDay() + 6) % 7;
  }
}
