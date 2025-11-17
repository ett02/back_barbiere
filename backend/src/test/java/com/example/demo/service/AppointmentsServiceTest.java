package com.example.demo.service;

import com.example.demo.dto.AppointmentRequest;
import com.example.demo.model.*;
import com.example.demo.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AppointmentsServiceTest {

    @Mock
    private AppointmentsRepository appointmentsRepository;

    @Mock
    private UsersRepository usersRepository;

    @Mock
    private BarbersRepository barbersRepository;

    @Mock
    private ServicesRepository servicesRepository;

    @Mock
    private WaitingListRepository waitingListRepository;

    @InjectMocks
    private AppointmentsService appointmentsService;

    private AppointmentRequest appointmentRequest;

    @BeforeEach
    void setUp() {
        appointmentRequest = new AppointmentRequest();
        appointmentRequest.setCustomerId(1L);
        appointmentRequest.setBarberId(1L);
        appointmentRequest.setServiceId(1L);
        appointmentRequest.setData(LocalDate.now());
        appointmentRequest.setOrarioInizio(LocalTime.of(10, 0));
    }

    @Test
    void createAppointment_shouldCreateAppointment_whenSlotIsAvailable() {
        Services service = new Services();
        service.setDurata(30);
        when(usersRepository.findById(1L)).thenReturn(Optional.of(new Users()));
        when(barbersRepository.findById(1L)).thenReturn(Optional.of(new Barbers()));
        when(servicesRepository.findById(1L)).thenReturn(Optional.of(service));
        when(appointmentsRepository.save(any(Appointments.class))).thenReturn(new Appointments());

        appointmentsService.createAppointment(appointmentRequest);

        verify(appointmentsRepository).save(any(Appointments.class));
    }

    @Test
    void createAppointment_shouldThrowException_whenSlotIsNotAvailable() {
        Services service = new Services();
        service.setDurata(30);
        when(servicesRepository.findById(1L)).thenReturn(Optional.of(service));
        Appointments existingAppointment = new Appointments();
        existingAppointment.setOrarioInizio(LocalTime.of(10, 0));
        existingAppointment.setService(service);
        when(appointmentsRepository.findByBarberIdAndDataAndStato(any(), any(), any())).thenReturn(java.util.Collections.singletonList(existingAppointment));

        assertThrows(RuntimeException.class, () -> {
            appointmentsService.createAppointment(appointmentRequest);
        });
    }

    @Test
    void cancelAppointment_shouldCancelAppointmentAndProcessWaitingList() {
        Appointments appointment = new Appointments();
        appointment.setBarber(new Barbers());
        appointment.setService(new Services());
        when(appointmentsRepository.findById(1L)).thenReturn(Optional.of(appointment));

        appointmentsService.cancelAppointment(1L);

        verify(appointmentsRepository).save(any(Appointments.class));
        verify(waitingListRepository).findFirstByBarberIdAndServiceIdAndDataRichiestaAndStatoOrderByDataIscrizioneAsc(any(), any(), any(), any());
    }
}
