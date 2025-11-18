import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Service } from '../models/service.model';
import { Barber } from '../models/barber.model';
import { Appointment } from '../models/appointment.model';
import { Availability } from '../models/availability.model';
import { WaitingList } from '../models/waiting-list.model';
import { BusinessHours } from '../models/business-hours.model';
import { AvailableSlot } from '../models/available-slot.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8080';

  // Service management
  getAllServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/services`);
  }

  createService(service: Partial<Service>): Observable<Service> {
    return this.http.post<Service>(`${this.apiUrl}/services`, service);
  }

  updateService(id: number, service: Partial<Service>): Observable<Service> {
    return this.http.put<Service>(`${this.apiUrl}/services/${id}`, service);
  }

  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/services/${id}`);
  }

  // Barber management
  getAllBarbers(): Observable<Barber[]> {
    return this.http.get<Barber[]>(`${this.apiUrl}/barbers`);
  }

  createBarber(barber: Partial<Barber>): Observable<Barber> {
    return this.http.post<Barber>(`${this.apiUrl}/barbers`, barber);
  }

  updateBarber(id: number, barber: Partial<Barber>): Observable<Barber> {
    return this.http.put<Barber>(`${this.apiUrl}/barbers/${id}`, barber);
  }

  getServicesForBarber(barberId: number): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/barbers/${barberId}/services`);
  }

  updateBarberServices(barberId: number, serviceIds: number[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/barbers/${barberId}/services`, { serviceIds });
  }

  deleteBarber(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/barbers/${id}`);
  }

  // Customer facing methods
  getBarbersForService(serviceId: number): Observable<Barber[]> {
    return this.http.get<Barber[]>(`${this.apiUrl}/barbers/service/${serviceId}`);
  }

  getBarberAvailability(barberId: number): Observable<Availability[]> {
    return this.http.get<Availability[]>(`${this.apiUrl}/barbers/${barberId}/availability`);
  }

  getAvailableSlots(barberId: number, serviceId: number, date: string): Observable<AvailableSlot[]> {
    return this.http.get<AvailableSlot[]>(`${this.apiUrl}/appointments/available-slots`, {
      params: {
        barberId,
        serviceId,
        date,
      },
    });
  }

  createAppointment(appointment: Partial<Appointment>): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.apiUrl}/appointments`, appointment);
  }

  getAppointmentsByUserId(userId: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointments/user/${userId}`);
  }

  getWaitingListByCustomerId(customerId: number): Observable<WaitingList[]> {
    return this.http.get<WaitingList[]>(`${this.apiUrl}/waiting-list/customer/${customerId}`);
  }

  cancelAppointment(appointmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/appointments/${appointmentId}`);
  }

  removeFromWaitingList(waitingId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/waiting-list/${waitingId}`);
  }

  getAppointmentsByDate(date: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointments/by-date`, {
      params: { date },
    });
  }

  getBusinessHours(): Observable<BusinessHours[]> {
    return this.http.get<BusinessHours[]>(`${this.apiUrl}/business-hours`);
  }

  updateBusinessHours(hours: BusinessHours[]): Observable<BusinessHours[]> {
    return this.http.put<BusinessHours[]>(`${this.apiUrl}/business-hours`, hours);
  }
}
