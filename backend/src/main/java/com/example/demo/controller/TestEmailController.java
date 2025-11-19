package com.example.demo.controller;

import com.example.demo.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalTime;

@RestController
@RequestMapping("/api/test")
@Tag(name = "Test Utilities", description = "Endpoint di utilità per testare le funzionalità")
public class TestEmailController {

    @Autowired
    private NotificationService notificationService;

    @PostMapping("/email")
    @Operation(summary = "Invia un'email di prova", description = "Invia un'email di conferma appuntamento simulata all'indirizzo specificato per verificare la configurazione SMTP.")
    public ResponseEntity<String> sendTestEmail(@RequestParam String email) {
        try {
            notificationService.notifyAppointmentConfirmed(
                email,
                "Utente Test",
                LocalDate.now().toString(),
                LocalTime.now().toString()
            );
            return ResponseEntity.ok("✅ Tentativo di invio email effettuato verso " + email + ". Controlla i log per confermare il successo o vedere errori.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("❌ Errore durante l'invio: " + e.getMessage());
        }
    }
}
