package com.example.demo.service;

/**
 * Service interface for sending notifications to customers.
 * Implementations can use Email, SMS, Push notifications, etc.
 */
public interface NotificationService {
    
    /**
     * Notify customer that a waiting list slot has been assigned.
     *
     * @param customerEmail Customer's email address
     * @param customerName Customer's name
     * @param appointmentDate Date of the appointment
     * @param appointmentTime Time of the appointment
     */
    void notifySlotAssigned(String customerEmail, String customerName, 
                           String appointmentDate, String appointmentTime);
    
    /**
     * Notify customer that their appointment has been confirmed.
     *
     * @param customerEmail Customer's email address
     * @param customerName Customer's name
     * @param appointmentDate Date of the appointment
     * @param appointmentTime Time of the appointment
     */
    void notifyAppointmentConfirmed(String customerEmail, String customerName,
                                   String appointmentDate, String appointmentTime);
    
    /**
     * Notify customer that their appointment has been cancelled.
     *
     * @param customerEmail Customer's email address
     * @param customerName Customer's name
     */
    void notifyAppointmentCancelled(String customerEmail, String customerName);
    
    /**
     * Notify customer about their position in the waiting list.
     *
     * @param customerEmail Customer's email address
     * @param customerName Customer's name
     * @param position Position in queue
     */
    void notifyWaitingListPosition(String customerEmail, String customerName, int position);
}
