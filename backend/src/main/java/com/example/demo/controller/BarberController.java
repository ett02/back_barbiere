package com.example.demo.controller;

import com.example.demo.dto.UpdateBarberServicesRequest;
import com.example.demo.model.Services;
import com.example.demo.repository.BarberServicesRepository;
import com.example.demo.service.BarberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/barbers")
@RequiredArgsConstructor
public class BarberController {

    private final BarberService barberService;
    private final BarberServicesRepository barberServicesRepository;

    /**
     * Ottiene i servizi associati a un barbiere specifico.
     */
    @GetMapping("/{barberId}/services")
    public ResponseEntity<List<Services>> getBarberServices(@PathVariable Long barberId) {
        List<Services> services = barberServicesRepository.findByBarberId(barberId)
                .stream()
                .map(barberService -> barberService.getService())
                .collect(Collectors.toList());
        return ResponseEntity.ok(services);
    }

    /**
     * Aggiorna l'elenco dei servizi per un barbiere specifico.
     */
    @PutMapping("/{barberId}/services")
    public ResponseEntity<Void> updateBarberServices(@PathVariable Long barberId, @RequestBody UpdateBarberServicesRequest request) {
        barberService.updateBarberServices(barberId, request.getServiceIds());
        return ResponseEntity.ok().build();
    }
}