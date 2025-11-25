package com.example.demo.exception;

/**
 * Exception thrown when a customer attempts to join a waiting list
 * they are already part of.
 */
public class DuplicateWaitingListException extends RuntimeException {

    public DuplicateWaitingListException(String message) {
        super(message);
    }

    public DuplicateWaitingListException(String message, Throwable cause) {
        super(message, cause);
    }
}
