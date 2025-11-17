package com.example.demo.controller;

import com.example.demo.dto.BarberAvailabilityRequest;
import com.example.demo.dto.BarberServiceRequest;
import com.example.demo.dto.UpdateBarberServicesRequest;
import com.example.demo.model.Barbers;
import com.example.demo.model.Availability;
import com.example.demo.model.BarberServices;
import com.example.demo.model.Services;
import com.example.demo.service.BarbersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/barbers")
public class BarbersController {

    @Autowired
    private BarbersService barbersService;

    @GetMapping
    public List<Barbers> getAllBarbers() {
        return barbersService.getAllBarbers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Barbers> getBarberById(@PathVariable Long id) {
        return barbersService.getBarberById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping
    public Barbers createBarber(@RequestBody Barbers barber) {
        return barbersService.createBarber(barber);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Barbers> updateBarber(@PathVariable Long id, @RequestBody Barbers barber) {
        return ResponseEntity.ok(barbersService.updateBarber(id, barber));
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBarber(@PathVariable Long id) {
        barbersService.deleteBarber(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    @PostMapping("/{id}/services")
    public ResponseEntity<BarberServices> assignServiceToBarber(
            @PathVariable Long id,
            @RequestBody BarberServiceRequest request) {
        return ResponseEntity.ok(barbersService.assignServiceToBarber(id, request.getServiceId()));
    }

    @GetMapping("/{id}/services")
    public List<Services> getBarberServices(@PathVariable Long id) {
        return barbersService.getServicesForBarber(id);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    @PutMapping("/{id}/services")
    public ResponseEntity<Void> updateBarberServices(@PathVariable Long id,
                                                     @RequestBody UpdateBarberServicesRequest request) {
        barbersService.updateBarberServices(id, request.getServiceIds());
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/{id}/availability")
    public ResponseEntity<Availability> addBarberAvailability(
            @PathVariable Long id,
            @RequestBody BarberAvailabilityRequest request) {
        return ResponseEntity.ok(barbersService.addAvailability(id, request));
    }

    @GetMapping("/{id}/availability")
    public List<Availability> getBarberAvailability(@PathVariable Long id) {
        return barbersService.getBarberAvailability(id);
    }

    @GetMapping("/service/{serviceId}")
    public List<Barbers> getBarbersByService(@PathVariable Long serviceId) {
        return barbersService.getBarbersByService(serviceId);
    }
}
