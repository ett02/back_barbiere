package com.example.demo.service;

import com.example.demo.dto.AppointmentRequest;
import com.example.demo.dto.AvailableSlotResponse;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.exception.SlotNotAvailableException;
import com.example.demo.exception.WaitingListProcessingException;
import com.example.demo.model.*;
import com.example.demo.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class AppointmentsService {
    
    private static final Logger logger = LoggerFactory.getLogger(AppointmentsService.class);

    @Autowired
    private AppointmentsRepository appointmentsRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private BarbersRepository barbersRepository;

    @Autowired
    private ServicesRepository servicesRepository;

    @Autowired
    private WaitingListRepository waitingListRepository;
        }

        Users customer = getEntityById(usersRepository, request.getCustomerId(), "Cliente non trovato");
        Barbers barber = getEntityById(barbersRepository, request.getBarberId(), "Barbiere non trovato");
        Services service = getEntityById(servicesRepository, request.getServiceId(), "Servizio non trovato");

        Appointments appointment = new Appointments();
        appointment.setCustomer(customer);
        appointment.setBarber(barber);
        appointment.setService(service);
        appointment.setData(request.getData());
        appointment.setOrarioInizio(request.getOrarioInizio());
        appointment.setStato(Appointments.StatoAppuntamento.CONFERMATO);

        return appointmentsRepository.save(appointment);
    }

    private <T, ID> T getEntityById(JpaRepository<T, ID> repository, ID id, String errorMessage) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException(errorMessage));
    }

    /**
     * Gets all appointments for a user.
     *
     * @param userId the user id
     * @return the list of appointments
     */
    public List<Appointments> getAppointmentsByUser(Long userId) {
        return appointmentsRepository.findByCustomerId(userId);
    }

    /**
     * Gets all appointments for a barber.
     *
     * @param barberId the barber id
     * @return the list of appointments
     */
    public List<Appointments> getAppointmentsByBarber(Long barberId) {
        return appointmentsRepository.findByBarberId(barberId);
    }

    /**
     * Gets an appointment by id.
     *
     * @param id the appointment id
     * @return the appointment
     */
    public Optional<Appointments> getAppointmentById(Long id) {
        return appointmentsRepository.findById(id);
    }

    /**
     * Gets all appointments.
     *
     * @return the list of appointments
     */
    public List<Appointments> getAllAppointments() {
        return appointmentsRepository.findAll();
    }

    /**
     * Updates an appointment.
     *
     * @param id      the appointment id
     * @param request the appointment request
     * @return the updated appointment
     */
    @Transactional
    public Appointments updateAppointment(Long id, AppointmentRequest request) {
        Appointments appointment = getEntityById(appointmentsRepository, id, "Appuntamento non trovato");

        if (!isSlotAvailable(request.getBarberId(), request.getData(), request.getOrarioInizio(), request.getServiceId())) {
            throw new SlotNotAvailableException(request.getData(), request.getOrarioInizio());
        }

        Barbers barber = getEntityById(barbersRepository, request.getBarberId(), "Barbiere non trovato");
        Services service = getEntityById(servicesRepository, request.getServiceId(), "Servizio non trovato");

        appointment.setBarber(barber);
        appointment.setService(service);
        appointment.setData(request.getData());
        appointment.setOrarioInizio(request.getOrarioInizio());

        return appointmentsRepository.save(appointment);
    }

    /**
     * Cancels an appointment.
     *
     * @param id the appointment id
     */
    @Transactional
    public void cancelAppointment(Long id) {
        Appointments appointment = appointmentsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", id));

        appointment.setStato(Appointments.StatoAppuntamento.ANNULLATO);
        appointmentsRepository.save(appointment);

        processWaitingListForCancelledAppointment(appointment);
    }

    private void processWaitingListForCancelledAppointment(Appointments cancelledAppointment) {
        // Find the first in the waiting list for that barber, service, and date
        Optional<WaitingList> firstInQueue = waitingListRepository
                .findFirstByBarberIdAndServiceIdAndDataRichiestaAndStatoOrderByDataIscrizioneAsc(
                        cancelledAppointment.getBarber().getId(),
                        cancelledAppointment.getService().getId(),
                        cancelledAppointment.getData(),
                        WaitingList.StatoListaAttesa.IN_ATTESA
                );

        if (firstInQueue.isPresent()) {
            WaitingList waitingEntry = firstInQueue.get();

            // Automatically create the appointment for the first in the queue
            AppointmentRequest appointmentRequest = new AppointmentRequest();
            appointmentRequest.setCustomerId(waitingEntry.getCustomer().getId());
            appointmentRequest.setBarberId(waitingEntry.getBarber().getId());
            appointmentRequest.setServiceId(waitingEntry.getService().getId());
            appointmentRequest.setData(cancelledAppointment.getData());
            appointmentRequest.setOrarioInizio(cancelledAppointment.getOrarioInizio());

            try {
                createAppointment(appointmentRequest);

                // Update the status in the waiting list
                waitingEntry.setStato(WaitingList.StatoListaAttesa.CONFERMATO);
                waitingListRepository.save(waitingEntry);
                
                logger.info("Slot automatically assigned to customer {} for {} at {}", 
                    waitingEntry.getCustomer().getId(), 
                    cancelledAppointment.getData(),
                    cancelledAppointment.getOrarioInizio());

            } catch (SlotNotAvailableException e) {
                logger.warn("Slot no longer available for waiting list entry {}: {}", 
                    waitingEntry.getId(), e.getMessage());
                waitingEntry.setStato(WaitingList.StatoListaAttesa.SCADUTO);
                waitingListRepository.save(waitingEntry);
            } catch (Exception e) {
                logger.error("Failed to assign slot to waiting list entry {}", 
                    waitingEntry.getId(), e);
                throw new WaitingListProcessingException(
                    "Failed to process waiting list", waitingEntry.getId(), e);
            }
        }
    }

    /**
     * Gets the available slots for a barber, service, and date.
     *
     * @param barberId  the barber id
     * @param serviceId the service id
     * @param date      the date
     * @return the list of available slots
     */
    public List<AvailableSlotResponse> getAvailableSlots(Long barberId, Long serviceId, LocalDate date) {
        List<AvailableSlotResponse> slots = new ArrayList<>();

        int dayOfWeek = date.getDayOfWeek().getValue() % 7;

        BusinessHours businessHours = businessHoursRepository.findByGiorno(dayOfWeek).orElse(null);
        if (businessHours != null && !businessHours.isAperto()) {
            return slots;
        }

        Services service = servicesRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service", serviceId));

        int serviceDuration = service.getDurata();
        if (serviceDuration <= 0) {
            return slots;
        }

        LocalTime apertura = businessHours.getApertura();
        LocalTime chiusura = businessHours.getChiusura();

        if (apertura == null || chiusura == null || !apertura.isBefore(chiusura)) {
            return slots;
        }

        LocalTime currentTime = apertura;

        while (!currentTime.plusMinutes(serviceDuration).isAfter(chiusura)) {
            LocalTime slotEnd = currentTime.plusMinutes(serviceDuration);
            boolean available = isSlotAvailable(barberId, date, currentTime, serviceId);

            slots.add(new AvailableSlotResponse(currentTime, slotEnd, available));

            currentTime = currentTime.plusMinutes(serviceDuration);
        }

        slots.sort(Comparator.comparing(AvailableSlotResponse::getOrarioInizio));
        return slots;
    }

    private boolean isSlotAvailable(Long barberId, LocalDate date, LocalTime orarioInizio, Long serviceId) {
        Services service = servicesRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service", serviceId));

        LocalTime orarioFine = orarioInizio.plusMinutes(service.getDurata());

        int dayOfWeek = date.getDayOfWeek().getValue() % 7;
        BusinessHours businessHours = businessHoursRepository.findByGiorno(dayOfWeek).orElse(null);

        if (businessHours != null) {
            if (!businessHours.isAperto()) {
                return false;
            }

            if (businessHours.getApertura() != null && orarioInizio.isBefore(businessHours.getApertura())) {
                return false;
            }

            if (businessHours.getChiusura() != null && orarioFine.isAfter(businessHours.getChiusura())) {
                return false;
            }
        }

        List<Appointments> existingAppointments = appointmentsRepository
                .findByBarberIdAndDataAndStato(barberId, date, Appointments.StatoAppuntamento.CONFERMATO);

        return existingAppointments.stream().noneMatch(appointment -> {
            LocalTime existingStart = appointment.getOrarioInizio();
            LocalTime existingEnd = existingStart.plusMinutes(appointment.getService().getDurata());
            return orarioInizio.isBefore(existingEnd) && orarioFine.isAfter(existingStart);
        });
    }

    public List<Appointments> getAppointmentsByDate(LocalDate date) {
        return appointmentsRepository.findByDataAndStato(date, Appointments.StatoAppuntamento.CONFERMATO);
    }
}
