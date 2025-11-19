package com.example.demo.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.time.LocalDate;

@Data
public class WaitingListRequest {
    
    @NotNull(message = "Customer ID è obbligatorio")
    @Positive(message = "Customer ID deve essere positivo")
    private Long customerId;
    
    @NotNull(message = "Barber ID è obbligatorio")
    @Positive(message = "Barber ID deve essere positivo")
    private Long barberId;
    
    @NotNull(message = "Service ID è obbligatorio")
    @Positive(message = "Service ID deve essere positivo")
    private Long serviceId;
    
    @NotNull(message = "Data richiesta è obbligatoria")
    @FutureOrPresent(message = "Data richiesta deve essere oggi o futura")
    private LocalDate dataRichiesta;
}
