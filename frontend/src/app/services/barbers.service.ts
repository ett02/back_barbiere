import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Barber } from '../models/barber.model';

@Injectable({
  providedIn: 'root'
})
export class BarbersService {

  // L'URL base per le operazioni sui barbieri (basato sul BarbersController.java pre-esistente)
  private apiUrl = '/barbers';

  constructor(private http: HttpClient) { }

  getBarberById(id: number): Observable<Barber> {
    return this.http.get<Barber>(`${this.apiUrl}/${id}`);
  }
}