package com.example.demo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Schema(description = "Richiesta per creare o aggiornare un appuntamento")
public class AppointmentRequest {
    
    @NotNull(message = "Customer ID è obbligatorio")
    @Positive(message = "Customer ID deve essere positivo")
    @Schema(description = "ID del cliente", example = "1", required = true)
    private Long customerId;
    
    @NotNull(message = "Barber ID è obbligatorio")
    @Positive(message = "Barber ID deve essere positivo")
    @Schema(description = "ID del barbiere", example = "1", required = true)
    private Long barberId;
    
    @NotNull(message = "Service ID è obbligatorio")
    @Positive(message = "Service ID deve essere positivo")
    @Schema(description = "ID del servizio", example = "1", required = true)
    private Long serviceId;
    
    @NotNull(message = "Data è obbligatoria")
    @FutureOrPresent(message = "Data deve essere oggi o futura")
    @Schema(description = "Data dell'appuntamento", example = "2025-11-20", required = true)
    private LocalDate data;
    
    @NotNull(message = "Orario di inizio è obbligatorio")
    @Schema(description = "Orario di inizio dell'appuntamento", example = "10:00", required = true)
    private LocalTime orarioInizio;
}
