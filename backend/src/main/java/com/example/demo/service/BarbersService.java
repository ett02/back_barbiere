package com.example.demo.service;

import com.example.demo.dto.BarberAvailabilityRequest;
import com.example.demo.model.Availability;
import com.example.demo.model.BarberServices;
import com.example.demo.model.Barbers;
import com.example.demo.model.Services;
import com.example.demo.repository.AvailabilityRepository;
import com.example.demo.repository.BarberServicesRepository;
import com.example.demo.repository.BarbersRepository;
import com.example.demo.repository.ServicesRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BarbersService {

    @Autowired
    private BarbersRepository barbersRepository;

    @Autowired
    private ServicesRepository servicesRepository;

    @Autowired
    private BarberServicesRepository barberServicesRepository;

    @Autowired
    private AvailabilityRepository availabilityRepository;

    /**
     * Gets all barbers.
     *
     * @return the list of barbers
     */
    public List<Barbers> getAllBarbers() {
        return barbersRepository.findAll();
    }

    /**
     * Gets a barber by id.
     *
     * @param id the barber id
     * @return the barber
     */
    public Optional<Barbers> getBarberById(Long id) {
        return barbersRepository.findById(id);
    }

    /**
     * Creates a new barber.
     *
     * @param barber the barber to create
     * @return the created barber
     */
    public Barbers createBarber(Barbers barber) {
        barber.setIsActive(true);
        return barbersRepository.save(barber);
    }

    /**
     * Updates a barber.
     *
     * @param id            the barber id
     * @param barberDetails the barber details
     * @return the updated barber
     */
    public Barbers updateBarber(Long id, Barbers barberDetails) {
        Barbers barber = barbersRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Barber not found"));
        
        barber.setNome(barberDetails.getNome());
        barber.setCognome(barberDetails.getCognome());
        barber.setEsperienza(barberDetails.getEsperienza());
        barber.setSpecialita(barberDetails.getSpecialita());
        barber.setIsActive(barberDetails.getIsActive());
        
        return barbersRepository.save(barber);
    }

    /**
     * Deletes a barber.
     *
     * @param id the barber id
     */
    public void deleteBarber(Long id) {
        barbersRepository.deleteById(id);
    }

    /**
     * Assigns a service to a barber.
     *
     * @param barberId  the barber id
     * @param serviceId the service id
     * @return the barber service
     */
    public BarberServices assignServiceToBarber(Long barberId, Long serviceId) {
        Barbers barber = barbersRepository.findById(barberId)
                .orElseThrow(() -> new RuntimeException("Barber not found"));
        Services service = servicesRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        BarberServices barberService = new BarberServices();
        barberService.setBarber(barber);
        barberService.setService(service);
        
        return barberServicesRepository.save(barberService);
    }

    /**
     * Gets all services for a barber.
     *
     * @param barberId the barber id
     * @return the list of barber services
     */
    public List<BarberServices> getBarberServices(Long barberId) {
        return barberServicesRepository.findByBarberId(barberId);
    }

    public List<Services> getServicesForBarber(Long barberId) {
        return barberServicesRepository.findByBarberId(barberId)
                .stream()
                .map(BarberServices::getService)
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateBarberServices(Long barberId, List<Long> serviceIds) {
        Barbers barber = barbersRepository.findById(barberId)
                .orElseThrow(() -> new RuntimeException("Barbiere non trovato"));

        barberServicesRepository.deleteByBarberId(barberId);

        for (Long serviceId : serviceIds) {
            Services service = servicesRepository.findById(serviceId)
                    .orElseThrow(() -> new RuntimeException("Servizio non trovato con id: " + serviceId));

            BarberServices barberService = new BarberServices();
            barberService.setBarber(barber);
            barberService.setService(service);
            barberServicesRepository.save(barberService);
        }
    }

    /**
     * Adds an availability for a barber.
     *
     * @param barberId the barber id
     * @param request  the availability request
     * @return the availability
     */
    public Availability addAvailability(Long barberId, BarberAvailabilityRequest request) {
        Barbers barber = barbersRepository.findById(barberId)
                .orElseThrow(() -> new RuntimeException("Barber not found"));

        Availability availability = new Availability();
        availability.setBarber(barber);
        availability.setGiorno(request.getGiorno());
        availability.setOrarioInizio(request.getOrarioInizio());
        availability.setOrarioFine(request.getOrarioFine());
        
        return availabilityRepository.save(availability);
    }

    /**
     * Gets the availability for a barber.
     *
     * @param barberId the barber id
     * @return the list of availabilities
     */
    public List<Availability> getBarberAvailability(Long barberId) {
        return availabilityRepository.findByBarberId(barberId);
    }

    /**
     * Gets all barbers that provide a service.
     *
     * @param serviceId the service id
     * @return the list of barbers
     */
    public List<Barbers> getBarbersByService(Long serviceId) {
        List<BarberServices> barberServices = barberServicesRepository.findByServiceId(serviceId);
        return barberServices.stream()
                .map(BarberServices::getBarber)
                .filter(Barbers::getIsActive)
                .collect(Collectors.toList());
    }
}
