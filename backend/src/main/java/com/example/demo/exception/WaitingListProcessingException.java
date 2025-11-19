package com.example.demo.exception;

import lombok.Getter;

/**
 * Exception thrown when waiting list processing fails.
 * Results in HTTP 500 Internal Server Error response.
 */
@Getter
public class WaitingListProcessingException extends RuntimeException {
    
    private final Long waitingListId;
    
    public WaitingListProcessingException(String message, Long waitingListId) {
        super(message);
        this.waitingListId = waitingListId;
    }
    
    public WaitingListProcessingException(String message, Long waitingListId, Throwable cause) {
        super(message, cause);
        this.waitingListId = waitingListId;
    }
}
