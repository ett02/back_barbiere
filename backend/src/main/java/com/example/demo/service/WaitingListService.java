package com.example.demo.service;

import com.example.demo.dto.WaitingListRequest;
import com.example.demo.model.*;
import com.example.demo.repository.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class WaitingListService {

    @Autowired
    private WaitingListRepository waitingListRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private BarbersRepository barbersRepository;

    @Autowired
    private ServicesRepository servicesRepository;

    @Autowired
    private AppointmentsRepository appointmentsRepository;

    /**
     * Adds a customer to the waiting list.
     *
     * @param request the waiting list request
     * @return the waiting list entry
     */
    @Transactional
    public WaitingList addToWaitingList(WaitingListRequest request) {
        Users customer = usersRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Cliente non trovato"));
        Barbers barber = barbersRepository.findById(request.getBarberId())
                .orElseThrow(() -> new RuntimeException("Barbiere non trovato"));
        Services service = servicesRepository.findById(request.getServiceId())
                .orElseThrow(() -> new RuntimeException("Servizio non trovato"));

        WaitingList waitingList = new WaitingList();
        waitingList.setCustomer(customer);
        waitingList.setBarber(barber);
        waitingList.setService(service);
        waitingList.setDataRichiesta(request.getDataRichiesta());
        waitingList.setDataIscrizione(LocalDateTime.now());
        waitingList.setStato(WaitingList.StatoListaAttesa.IN_ATTESA);

        return waitingListRepository.save(waitingList);
    }

    /**
     * Gets the waiting list for a customer.
     *
     * @param customerId the customer id
     * @return the list of waiting list entries
     */
    public List<WaitingList> getWaitingListByCustomer(Long customerId) {
        return waitingListRepository.findByCustomerId(customerId);
    }

    /**
     * Gets the active waiting list for a barber and date.
     *
     * @param barberId the barber id
     * @param data     the date
     * @return the list of waiting list entries
     */
    public List<WaitingList> getActiveWaitingListByBarberAndDate(Long barberId, java.time.LocalDate data) {
        return waitingListRepository.findByBarberIdAndDataRichiestaAndStatoOrderByDataIscrizioneAsc(
                barberId, data, WaitingList.StatoListaAttesa.IN_ATTESA);
    }

    @Transactional
    public void processWaitingListForCancelledAppointment(Long barberId, Long serviceId, LocalDate date) {
        // Trova il primo in coda per questo barbiere/servizio/data
        Optional<WaitingList> firstInQueue = waitingListRepository
                .findFirstByBarberIdAndServiceIdAndDataRichiestaAndStatoOrderByDataIscrizioneAsc(
                        barberId, serviceId, date, WaitingList.StatoListaAttesa.IN_ATTESA
                );

        if (firstInQueue.isPresent()) {
            WaitingList waiting = firstInQueue.get();
            
            // Crea appuntamento automatico per il primo in coda
            Appointments newAppointment = new Appointments();
            
            com.example.demo.model.Users customer = new com.example.demo.model.Users();
            customer.setId(waiting.getCustomer().getId());
            newAppointment.setCustomer(customer);
            
            com.example.demo.model.Barbers barber = new com.example.demo.model.Barbers();
            barber.setId(barberId);
            newAppointment.setBarber(barber);
            
            Services service = new Services();
            service.setId(serviceId);
            newAppointment.setService(service);
            
            newAppointment.setData(date);
            newAppointment.setOrarioInizio(LocalTime.of(9, 0));
            newAppointment.setStato(Appointments.StatoAppuntamento.CONFERMATO);
            
            appointmentsRepository.save(newAppointment);
            
            // Aggiorna stato lista d'attesa
            waiting.setStato(WaitingList.StatoListaAttesa.CONFERMATO);
            waitingListRepository.save(waiting);
            
            System.out.println("✅ Slot assegnato automaticamente a: " + waiting.getCustomer().getEmail());
        } else {
            System.out.println("ℹ️ Nessuno in lista d'attesa per questo slot");
        }
    }

    @Transactional
    public void cancelWaitingListEntry(Long id) {
        WaitingList entry = waitingListRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Voce lista d'attesa non trovata"));
        entry.setStato(WaitingList.StatoListaAttesa.ANNULLATO);
        waitingListRepository.save(entry);
    }

    /**
     * Gets the position of a customer in the waiting list.
     *
     * @param waitingListId the waiting list entry id
     * @return the position in the queue
     */
    public Integer getPositionInQueue(Long waitingListId) {
        WaitingList entry = waitingListRepository.findById(waitingListId)
                .orElseThrow(() -> new RuntimeException("Voce lista d'attesa non trovata"));

        List<WaitingList> queue = waitingListRepository
                .findByBarberIdAndDataRichiestaAndStatoOrderByDataIscrizioneAsc(
                        entry.getBarber().getId(),
                        entry.getDataRichiesta(),
                        WaitingList.StatoListaAttesa.IN_ATTESA
                );

        for (int i = 0; i < queue.size(); i++) {
            if (queue.get(i).getId().equals(waitingListId)) {
                return i + 1; // Posizione 1-based
            }
        }

        return null;
    }
}
