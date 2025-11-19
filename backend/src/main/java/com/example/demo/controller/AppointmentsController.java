package com.example.demo.controller;

import com.example.demo.dto.AppointmentRequest;
import com.example.demo.dto.AvailableSlotResponse;
import com.example.demo.dto.ErrorResponse;
import com.example.demo.model.Appointments;
import com.example.demo.service.AppointmentsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/appointments")
@Tag(name = "Appointments", description = "Gestione appuntamenti barbiere")
@SecurityRequirement(name = "bearerAuth")
public class AppointmentsController {

    @Autowired
    private AppointmentsService appointmentsService;

    @PostMapping
    @Operation(summary = "Crea nuovo appuntamento", 
               description = "Crea un nuovo appuntamento se lo slot è disponibile")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Appuntamento creato con successo",
                     content = @Content(schema = @Schema(implementation = Appointments.class))),
        @ApiResponse(responseCode = "400", description = "Dati non validi",
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "409", description = "Slot non disponibile",
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Appointments> createAppointment(@Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(appointmentsService.createAppointment(request));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Ottieni appuntamenti per utente",
               description = "Restituisce tutti gli appuntamenti di un cliente specifico")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista appuntamenti recuperata")
    })
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
            @Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(appointmentsService.updateAppointment(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancella appuntamento",
               description = "Cancella un appuntamento e processa automaticamente la lista d'attesa")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Appuntamento cancellato con successo"),
        @ApiResponse(responseCode = "404", description = "Appuntamento non trovato",
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Void> cancelAppointment(@PathVariable Long id) {
        appointmentsService.cancelAppointment(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/available-slots")
    @Operation(summary = "Ottieni slot disponibili",
               description = "Restituisce tutti gli slot disponibili per un barbiere, servizio e data specifici")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista slot recuperata")
    })
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
