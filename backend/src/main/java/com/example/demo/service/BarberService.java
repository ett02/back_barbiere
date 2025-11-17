package com.example.demo.service;

import com.example.demo.model.BarberServices;
import com.example.demo.model.Barbers;
import com.example.demo.model.Services;
import com.example.demo.repository.BarbersRepository;
import com.example.demo.repository.BarberServicesRepository;
import com.example.demo.repository.ServicesRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BarberService {

    private final BarbersRepository barberRepository;
    private final ServicesRepository serviceRepository;
    private final BarberServicesRepository barberServicesRepository;

    @Transactional
    public void updateBarberServices(Long barberId, List<Long> serviceIds) {
        Barbers barber = barberRepository.findById(barberId)
                .orElseThrow(() -> new RuntimeException("Barbiere non trovato con id: " + barberId));

        // Rimuovi le vecchie associazioni
        barberServicesRepository.deleteByBarberId(barberId);

        // Crea le nuove associazioni
        for (Long serviceId : serviceIds) {
            Services service = serviceRepository.findById(serviceId)
                    .orElseThrow(() -> new RuntimeException("Servizio non trovato con id: " + serviceId));
            BarberServices barberService = new BarberServices();
            barberService.setBarber(barber);
            barberService.setService(service);
            barberServicesRepository.save(barberService);
        }
    }
}
