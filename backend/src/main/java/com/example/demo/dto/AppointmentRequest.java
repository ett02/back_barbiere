package com.example.demo.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AppointmentRequest {
    private Long customerId;
    private Long barberId;
    private Long serviceId;
    private LocalDate data;
    private LocalTime orarioInizio;
}
