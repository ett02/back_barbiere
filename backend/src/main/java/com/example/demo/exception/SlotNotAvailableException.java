package com.example.demo.exception;

import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Exception thrown when a requested appointment slot is not available.
 * Results in HTTP 409 Conflict response.
 */
@Getter
public class SlotNotAvailableException extends RuntimeException {
    
    private final LocalDate date;
    private final LocalTime time;
    
    public SlotNotAvailableException(LocalDate date, LocalTime time) {
        super(String.format("Slot non disponibile per %s alle %s", date, time));
        this.date = date;
        this.time = time;
    }
    
    public SlotNotAvailableException(String message) {
        super(message);
        this.date = null;
        this.time = null;
    }
}
