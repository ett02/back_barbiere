package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Standard error response DTO for all API errors.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Risposta di errore standard")
public class ErrorResponse {
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Timestamp dell'errore", example = "2025-11-19T20:00:00")
    private LocalDateTime timestamp;
    
    @Schema(description = "Codice HTTP di stato", example = "404")
    private int status;
    
    @Schema(description = "Tipo di errore", example = "Not Found")
    private String error;
    
    @Schema(description = "Messaggio di errore dettagliato", example = "Appointment non trovato con id: 123")
    private String message;
    
    @Schema(description = "Path della richiesta", example = "/appointments/123")
    private String path;
}
