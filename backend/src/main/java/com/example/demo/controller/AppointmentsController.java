package com.example.demo.controller;

import com.example.demo.dto.AppointmentRequest;
import com.example.demo.dto.AvailableSlotResponse;
import com.example.demo.model.Appointments;
import com.example.demo.service.AppointmentsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/appointments")
public class AppointmentsController {

    @Autowired
    private AppointmentsService appointmentsService;

    @PostMapping
    public ResponseEntity<Appointments> createAppointment(@RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(appointmentsService.createAppointment(request));
    }

    @GetMapping("/user/{userId}")
    public List<Appointments> getAppointmentsByUser(@PathVariable Long userId) {
        return appointmentsService.getAppointmentsByUser(userId);
    }

    @GetMapping("/barber/{barberId}")
    public List<Appointments> getAppointmentsByBarber(@PathVariable Long barberId) {
        return appointmentsService.getAppointmentsByBarber(barberId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Appointments> getAppointmentById(@PathVariable Long id) {
        return appointmentsService.getAppointmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Appointments> updateAppointment(
            @PathVariable Long id,
            @RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(appointmentsService.updateAppointment(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelAppointment(@PathVariable Long id) {
        appointmentsService.cancelAppointment(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/available-slots")
    public List<AvailableSlotResponse> getAvailableSlots(
            @RequestParam Long barberId,
            @RequestParam Long serviceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return appointmentsService.getAvailableSlots(barberId, serviceId, date);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public List<Appointments> getAllAppointments() {
        return appointmentsService.getAllAppointments();
    }

    @GetMapping("/by-date")
    @PreAuthorize("hasAuthority('ADMIN')")
    public List<Appointments> getAppointmentsByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return appointmentsService.getAppointmentsByDate(date);
    }
}
