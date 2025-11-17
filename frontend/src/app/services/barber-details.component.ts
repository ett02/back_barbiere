import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BarberAdminService } from './barber-admin.service';
import { Service } from '../models/service.model';
import { Barber } from '../models/barber.model';
import { BarbersService } from './barbers.service';

@Component({
  selector: 'app-barber-details',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './barber-details.component.html',
  styleUrls: ['./barber-details.component.css']
})
export class BarberDetailsComponent implements OnInit {
  barber: Barber | undefined;
  allServices: Service[] = [];
  selectedServiceIds: Set<number> = new Set();
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private barberAdminService: BarberAdminService,
    private barbersService: BarbersService // Servizio per ottenere i dettagli del barbiere
  ) { }

  ngOnInit(): void {
    const barberId = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(barberId)) {
      this.router.navigate(['/admin/barbers']);
      return;
    }

    forkJoin({
      barber: this.barbersService.getBarberById(barberId), // Metodo da /barbers/{id}
      allServices: this.barberAdminService.getAllServices(),
      barberServices: this.barberAdminService.getServicesForBarber(barberId)
    }).subscribe({
      next: ({ barber, allServices, barberServices }: { barber: Barber, allServices: Service[], barberServices: Service[] }) => {
        this.barber = barber;
        this.allServices = allServices;
        this.selectedServiceIds = new Set(barberServices.map(s => s.id));
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Errore nel caricamento dei dati. Riprova più tardi.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  onServiceChange(serviceId: number, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    isChecked ? this.selectedServiceIds.add(serviceId) : this.selectedServiceIds.delete(serviceId);
  }

  saveBarberServices(): void {
    if (!this.barber) return;
    const serviceIds = Array.from(this.selectedServiceIds);
    this.barberAdminService.updateServicesForBarber(this.barber.id, serviceIds)
      .subscribe(() => alert('Servizi aggiornati con successo!'));
  }
}
