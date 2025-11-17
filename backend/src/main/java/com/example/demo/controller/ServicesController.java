package com.example.demo.controller;

import com.example.demo.model.Barbers;
import com.example.demo.model.Services;
import com.example.demo.service.BarbersService;
import com.example.demo.service.ServicesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/services")
public class ServicesController {

    @Autowired
    private ServicesService servicesService;

    @Autowired
    private BarbersService barbersService;

    @PostMapping
    public Services createService(@RequestBody @NonNull Services service) {
        return servicesService.createService(service);
    }

    @GetMapping
    public List<Services> getAllServices() {
        return servicesService.getAllServices();
    }

    @GetMapping("/{id}")
    public Services getServiceById(@PathVariable @NonNull Long id) {
        return servicesService.getServiceById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Services> updateService(@PathVariable Long id, @RequestBody Services service) {
        return ResponseEntity.ok(servicesService.updateService(id, service));
    }

    @DeleteMapping("/{id}")
    public void deleteService(@PathVariable @NonNull Long id) {
        servicesService.deleteService(id);
    }

    @GetMapping("/{id}/barbers")
    public List<Barbers> getBarbersByService(@PathVariable Long id) {
        return barbersService.getBarbersByService(id);
    }
}
