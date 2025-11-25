import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Service } from '../models/service.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BarberAdminService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Ottiene tutti i servizi disponibili
  getAllServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/services`);
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

  // Ottiene la lista d'attesa per una data specifica
  getWaitingListByDate(date: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/waiting-list/by-date?date=${date}`);
  }
}