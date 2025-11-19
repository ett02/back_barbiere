package com.example.demo.exception;

import lombok.Getter;

/**
 * Exception thrown when a requested resource is not found.
 * Results in HTTP 404 Not Found response.
 */
@Getter
public class ResourceNotFoundException extends RuntimeException {
    
    private final String resourceType;
    private final Long resourceId;
    
    public ResourceNotFoundException(String resourceType, Long resourceId) {
        super(String.format("%s non trovato con id: %d", resourceType, resourceId));
        this.resourceType = resourceType;
        this.resourceId = resourceId;
    }
    
    public ResourceNotFoundException(String message) {
        super(message);
        this.resourceType = null;
        this.resourceId = null;
    }
}
