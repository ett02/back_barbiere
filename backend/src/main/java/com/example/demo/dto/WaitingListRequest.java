package com.example.demo.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class WaitingListRequest {
    private Long customerId;
    private Long barberId;
    private Long serviceId;
    private LocalDate dataRichiesta;
}
