import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CustomerDashboardComponent } from './customer-dashboard.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { of } from 'rxjs';
import { Appointment } from '../../models/appointment.model';

describe('CustomerDashboardComponent', () => {
  let component: CustomerDashboardComponent;
  let fixture: ComponentFixture<CustomerDashboardComponent>;
  let apiService: ApiService;

  const authServiceMock = {
    getDecodedToken: () => ({ id: 1, sub: 'test@test.com' }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, CustomerDashboardComponent],
      providers: [ApiService, { provide: AuthService, useValue: authServiceMock }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerDashboardComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load appointments on init', () => {
    const dummyAppointments: Appointment[] = [
      {
        id: 1,
        customer: {} as any,
        barber: {} as any,
        service: {} as any,
        data: new Date('2022-01-01'),
        orarioInizio: '10:00',
        stato: 'CONFIRMATO',
      },
      {
        id: 2,
        customer: {} as any,
        barber: {} as any,
        service: {} as any,
        data: new Date('2022-01-02'),
        orarioInizio: '11:00',
        stato: 'CONFIRMATO',
      },
    ];
    spyOn(apiService, 'getAppointmentsByUserId').and.returnValue(of(dummyAppointments));
    component.ngOnInit();
    expect(component.appointments.length).toBe(2);
    expect(component.appointments).toEqual(dummyAppointments);
  });
});
