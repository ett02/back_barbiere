package com.example.demo.service;

import com.example.demo.model.Services;
import com.example.demo.repository.ServicesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ServicesService {

    @Autowired
    private ServicesRepository servicesRepository;

    /**
     * Creates a new service.
     *
     * @param service the service to create
     * @return the created service
     */
    public Services createService(@NonNull Services service) {
        return servicesRepository.save(service);
    }

    /**
     * Gets all services.
     *
     * @return the list of services
     */
    public List<Services> getAllServices() {
        return servicesRepository.findAll();
    }

    /**
     * Gets a service by id.
     *
     * @param id the service id
     * @return the service
     */
    public Optional<Services> getServiceById(@NonNull Long id) {
        return servicesRepository.findById(id);
    }

    /**
     * Updates a service.
     *
     * @param id             the service id
     * @param serviceDetails the service details
     * @return the updated service
     */
    public Services updateService(Long id, Services serviceDetails) {
        Services service = servicesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        service.setNome(serviceDetails.getNome());
        service.setDescrizione(serviceDetails.getDescrizione());
        service.setDurata(serviceDetails.getDurata());
        service.setPrezzo(serviceDetails.getPrezzo());

        return servicesRepository.save(service);
    }

    /**
     * Deletes a service.
     *
     * @param id the service id
     */
    public void deleteService(@NonNull Long id) {
        servicesRepository.deleteById(id);
    }
}
