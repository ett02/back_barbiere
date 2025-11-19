package com.example.demo.controller;

import com.example.demo.dto.WaitingListRequest;
import com.example.demo.model.WaitingList;
import com.example.demo.service.WaitingListService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/waiting-list")
@Tag(name = "Waiting List", description = "Gestione lista d'attesa")
@SecurityRequirement(name = "bearerAuth")
public class WaitingListController {

    @Autowired
    private WaitingListService waitingListService;

    @PostMapping
    @Operation(summary = "Aggiungi alla lista d'attesa",
               description = "Aggiunge un cliente alla lista d'attesa per un servizio specifico")
    public ResponseEntity<WaitingList> addToWaitingList(@Valid @RequestBody WaitingListRequest request) {
        return ResponseEntity.ok(waitingListService.addToWaitingList(request));
    }

    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Lista d'attesa per cliente",
               description = "Restituisce tutte le voci in lista d'attesa per un cliente")
    public List<WaitingList> getWaitingListByCustomer(@PathVariable Long customerId) {
        return waitingListService.getWaitingListByCustomer(customerId);
    }

    @GetMapping("/barber/{barberId}")
    public List<WaitingList> getWaitingListByBarberAndDate(
            @PathVariable Long barberId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return waitingListService.getActiveWaitingListByBarberAndDate(barberId, date);
    }

    @GetMapping("/{id}/position")
    public ResponseEntity<Integer> getPositionInQueue(@PathVariable Long id) {
        Integer position = waitingListService.getPositionInQueue(id);
        if (position != null) {
            return ResponseEntity.ok(position);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelWaitingListEntry(@PathVariable Long id) {
        waitingListService.cancelWaitingListEntry(id);
        return ResponseEntity.noContent().build();
    }
}
