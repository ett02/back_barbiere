package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalTime;

@Data
@AllArgsConstructor
public class AvailableSlotResponse {
    private LocalTime orarioInizio;
    private LocalTime orarioFine;
    private boolean available;
}
