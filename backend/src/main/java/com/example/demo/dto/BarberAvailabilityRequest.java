package com.example.demo.dto;

import lombok.Data;
import java.time.LocalTime;

@Data
public class BarberAvailabilityRequest {
    private Integer giorno; // 0=Domenica, 1=Lunedì, ..., 6=Sabato
    private LocalTime orarioInizio;
    private LocalTime orarioFine;
}
