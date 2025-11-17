import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { Appointment } from '../models/appointment.model';
import { User } from '../models/user.model';
import { Barber } from '../models/barber.model';
import { Service } from '../models/service.model';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService],
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve appointments by user id', () => {
    const dummyAppointments: Appointment[] = [
      {
        id: 1,
        customer: {} as User,
        barber: {} as Barber,
        service: {} as Service,
        data: new Date('2022-01-01'),
        orarioInizio: '10:00',
        stato: 'CONFIRMATO',
      },
      {
        id: 2,
        customer: {} as User,
        barber: {} as Barber,
        service: {} as Service,
        data: new Date('2022-01-02'),
        orarioInizio: '11:00',
        stato: 'CONFIRMATO',
      },
    ];

    service.getAppointmentsByUserId(1).subscribe((appointments) => {
      expect(appointments.length).toBe(2);
      expect(appointments).toEqual(dummyAppointments);
    });

    const req = httpMock.expectOne('http://localhost:8080/appointments/user/1');
    expect(req.request.method).toBe('GET');
    req.flush(dummyAppointments);
  });
});
