package com.example.demo.service;

import com.example.demo.model.Availability;
import com.example.demo.model.Barbers;
import com.example.demo.repository.AvailabilityRepository;
import com.example.demo.repository.BarbersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AvailabilityService {

    @Autowired
    private AvailabilityRepository availabilityRepository;

    @Autowired
    private BarbersRepository barbersRepository;

    public Availability createAvailability(Long barberId, Availability availability) {
        Barbers barber = barbersRepository.findById(barberId).orElseThrow();
        availability.setBarber(barber); // CAMBIATO da setBarbiere a setBarber
        return availabilityRepository.save(availability);
    }

    public List<Availability> getAllAvailability() {
        return availabilityRepository.findAll();
    }

    public List<Availability> getAvailabilityByBarber(Long barberId) {
        return availabilityRepository.findByBarberId(barberId);
    }
}
