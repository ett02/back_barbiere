import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { WaitingList } from '../models/waiting-list.model';

@Injectable({
    providedIn: 'root'
})
export class WaitingListService {
    private apiUrl = `${environment.apiUrl}/waiting-list`;

    constructor(private http: HttpClient) { }

    joinWaitingList(request: { customerId: number, barberId: number, serviceId: number, dataRichiesta: string }): Observable<WaitingList> {
        return this.http.post<WaitingList>(this.apiUrl, request);
    }

    getWaitingListByCustomer(customerId: number): Observable<WaitingList[]> {
        return this.http.get<WaitingList[]>(`${this.apiUrl}/customer/${customerId}`);
    }

    getWaitingListByBarberAndDate(barberId: number, date: string): Observable<WaitingList[]> {
        return this.http.get<WaitingList[]>(`${this.apiUrl}/barber/${barberId}/date/${date}`);
    }

    cancelWaitingListEntry(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
