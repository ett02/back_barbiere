package com.example.demo.controller;

import com.example.demo.model.Availability;
import com.example.demo.service.AvailabilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/availability")
public class AvailabilityController {

    @Autowired
    private AvailabilityService availabilityService;

    @PostMapping("/{barberId}")
    public Availability createAvailability(@PathVariable Long barberId, @RequestBody Availability availability) {
        return availabilityService.createAvailability(barberId, availability); // CAMBIATO da setAvailability
    }

    @GetMapping
    public List<Availability> getAllAvailability() {
        return availabilityService.getAllAvailability();
    }

    @GetMapping("/{barberId}")
    public List<Availability> getAvailabilityByBarber(@PathVariable Long barberId) {
        return availabilityService.getAvailabilityByBarber(barberId);
    }
}
