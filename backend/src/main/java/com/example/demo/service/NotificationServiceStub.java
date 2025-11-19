package com.example.demo.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Stub implementation of NotificationService for logging only.
 * Replace with real implementation (Email/SMS) when ready.
 */
@Service
public class NotificationServiceStub implements NotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationServiceStub.class);
    
    @Override
    public void notifySlotAssigned(String customerEmail, String customerName, 
                                  String appointmentDate, String appointmentTime) {
        logger.info("📧 [NOTIFICATION] Slot assigned to {} ({}): {} at {}", 
            customerName, customerEmail, appointmentDate, appointmentTime);
        // TODO: Implement actual email/SMS sending
    }
    
    @Override
    public void notifyAppointmentConfirmed(String customerEmail, String customerName,
                                          String appointmentDate, String appointmentTime) {
        logger.info("📧 [NOTIFICATION] Appointment confirmed for {} ({}): {} at {}",
            customerName, customerEmail, appointmentDate, appointmentTime);
        // TODO: Implement actual email/SMS sending
    }
    
    @Override
    public void notifyAppointmentCancelled(String customerEmail, String customerName) {
        logger.info("📧 [NOTIFICATION] Appointment cancelled for {} ({})",
            customerName, customerEmail);
        // TODO: Implement actual email/SMS sending
    }
    
    @Override
    public void notifyWaitingListPosition(String customerEmail, String customerName, int position) {
        logger.info("📧 [NOTIFICATION] Waiting list position for {} ({}): {}",
            customerName, customerEmail, position);
        // TODO: Implement actual email/SMS sending
    }
}
