import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Service } from '../models/service.model';

@Injectable({
  providedIn: 'root'
})
export class BarberAdminService {

  private apiUrl = '/api'; // Assumendo un proxy configurato in Angular

  constructor(private http: HttpClient) { }

  // Ottiene tutti i servizi disponibili
  getAllServices(): Observable<Service[]> {
    // NOTA: L'endpoint è /services, non /api/services. Adattato alla struttura esistente.
    return this.http.get<Service[]>('/services');
  }

  // Ottiene i servizi associati a un barbiere
  getServicesForBarber(barberId: number): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/barbers/${barberId}/services`);
  }

  // Aggiorna i servizi per un barbiere
  updateServicesForBarber(barberId: number, serviceIds: number[]): Observable<void> {
    const payload = { serviceIds };
    return this.http.put<void>(`${this.apiUrl}/barbers/${barberId}/services`, payload);
  }
}