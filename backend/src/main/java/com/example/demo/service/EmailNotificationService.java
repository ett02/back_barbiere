package com.example.demo.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

/**
 * Email implementation of NotificationService using Spring Mail.
 * Sends HTML emails for appointment notifications.
 */
@Service
@Primary
public class EmailNotificationService implements NotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailNotificationService.class);
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${app.mail.from}")
    private String fromEmail;
    
    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;
    
    @Override
    public void notifySlotAssigned(String customerEmail, String customerName, 
                                  String appointmentDate, String appointmentTime) {
        if (!mailEnabled) {
            logger.info("📧 [EMAIL DISABLED] Slot assigned to {} ({}): {} at {}", 
                customerName, customerEmail, appointmentDate, appointmentTime);
            return;
        }
        
        String subject = "🎉 Slot Disponibile Assegnato - Barber Shop";
        String htmlContent = buildSlotAssignedEmail(customerName, appointmentDate, appointmentTime);
        
        sendEmail(customerEmail, subject, htmlContent);
        logger.info("📧 [EMAIL SENT] Slot assigned notification sent to {}", customerEmail);
    }
    
    @Override
    public void notifyAppointmentConfirmed(String customerEmail, String customerName,
                                          String appointmentDate, String appointmentTime) {
        if (!mailEnabled) {
            logger.info("📧 [EMAIL DISABLED] Appointment confirmed for {} ({}): {} at {}",
                customerName, customerEmail, appointmentDate, appointmentTime);
            return;
        }
        
        String subject = "✅ Appuntamento Confermato - Barber Shop";
        String htmlContent = buildAppointmentConfirmedEmail(customerName, appointmentDate, appointmentTime);
        
        sendEmail(customerEmail, subject, htmlContent);
        logger.info("📧 [EMAIL SENT] Appointment confirmation sent to {}", customerEmail);
    }
    
    @Override
    public void notifyAppointmentCancelled(String customerEmail, String customerName) {
        if (!mailEnabled) {
            logger.info("📧 [EMAIL DISABLED] Appointment cancelled for {} ({})",
                customerName, customerEmail);
            return;
        }
        
        String subject = "❌ Appuntamento Cancellato - Barber Shop";
        String htmlContent = buildAppointmentCancelledEmail(customerName);
        
        sendEmail(customerEmail, subject, htmlContent);
        logger.info("📧 [EMAIL SENT] Cancellation notification sent to {}", customerEmail);
    }
    
    @Override
    public void notifyWaitingListPosition(String customerEmail, String customerName, int position) {
        if (!mailEnabled) {
            logger.info("📧 [EMAIL DISABLED] Waiting list position for {} ({}): {}",
                customerName, customerEmail, position);
            return;
        }
        
        String subject = "📋 Posizione in Lista d'Attesa - Barber Shop";
        String htmlContent = buildWaitingListPositionEmail(customerName, position);
        
        sendEmail(customerEmail, subject, htmlContent);
        logger.info("📧 [EMAIL SENT] Waiting list position sent to {}", customerEmail);
    }
    
    /**
     * Send HTML email
     */
    private void sendEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true = HTML
            
            mailSender.send(message);
            
        } catch (MessagingException e) {
            logger.error("Failed to create email message for {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Failed to send email", e);
        } catch (MailException e) {
            logger.error("Failed to send email to {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Failed to send email", e);
        }
    }
    
    /**
     * Build HTML email for slot assigned notification
     */
    private String buildSlotAssignedEmail(String customerName, String date, String time) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .highlight { background: #fff; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
                    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Slot Disponibile!</h1>
                    </div>
                    <div class="content">
                        <p>Ciao <strong>%s</strong>,</p>
                        <p>Ottima notizia! Ti è stato assegnato automaticamente un appuntamento dalla lista d'attesa.</p>
                        <div class="highlight">
                            <h3>📅 Dettagli Appuntamento</h3>
                            <p><strong>Data:</strong> %s</p>
                            <p><strong>Orario:</strong> %s</p>
                        </div>
                        <p>Il tuo appuntamento è stato confermato automaticamente. Ti aspettiamo!</p>
                        <p>Se hai bisogno di modificare o cancellare l'appuntamento, contattaci il prima possibile.</p>
                        <div class="footer">
                            <p>Grazie per aver scelto Barber Shop</p>
                            <p>Questo è un messaggio automatico, per favore non rispondere a questa email.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """, customerName, formatDate(date), time);
    }
    
    /**
     * Build HTML email for appointment confirmed notification
     */
    private String buildAppointmentConfirmedEmail(String customerName, String date, String time) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #11998e 0%%, #38ef7d 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .highlight { background: #fff; padding: 20px; border-left: 4px solid #11998e; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Appuntamento Confermato</h1>
                    </div>
                    <div class="content">
                        <p>Ciao <strong>%s</strong>,</p>
                        <p>Il tuo appuntamento è stato confermato con successo!</p>
                        <div class="highlight">
                            <h3>📅 Dettagli Appuntamento</h3>
                            <p><strong>Data:</strong> %s</p>
                            <p><strong>Orario:</strong> %s</p>
                        </div>
                        <p>Ti aspettiamo! Per favore arriva 5 minuti prima dell'orario prenotato.</p>
                        <p><strong>Importante:</strong> Se non puoi presentarti, ti preghiamo di cancellare l'appuntamento con almeno 24 ore di anticipo.</p>
                        <div class="footer">
                            <p>Grazie per aver scelto Barber Shop</p>
                            <p>Questo è un messaggio automatico, per favore non rispondere a questa email.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """, customerName, formatDate(date), time);
    }
    
    /**
     * Build HTML email for appointment cancelled notification
     */
    private String buildAppointmentCancelledEmail(String customerName) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #f093fb 0%%, #f5576c 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>❌ Appuntamento Cancellato</h1>
                    </div>
                    <div class="content">
                        <p>Ciao <strong>%s</strong>,</p>
                        <p>Il tuo appuntamento è stato cancellato.</p>
                        <p>Se desideri prenotare un nuovo appuntamento, puoi farlo tramite la nostra app o contattandoci direttamente.</p>
                        <p>Speriamo di vederti presto!</p>
                        <div class="footer">
                            <p>Grazie per aver scelto Barber Shop</p>
                            <p>Questo è un messaggio automatico, per favore non rispondere a questa email.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """, customerName);
    }
    
    /**
     * Build HTML email for waiting list position notification
     */
    private String buildWaitingListPositionEmail(String customerName, int position) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #4facfe 0%%, #00f2fe 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .highlight { background: #fff; padding: 20px; text-align: center; margin: 20px 0; }
                    .position { font-size: 48px; font-weight: bold; color: #4facfe; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📋 Lista d'Attesa</h1>
                    </div>
                    <div class="content">
                        <p>Ciao <strong>%s</strong>,</p>
                        <p>Sei stato aggiunto alla lista d'attesa!</p>
                        <div class="highlight">
                            <p>La tua posizione attuale è:</p>
                            <div class="position">%d</div>
                        </div>
                        <p>Ti notificheremo automaticamente quando un posto si libera.</p>
                        <p>Grazie per la pazienza!</p>
                        <div class="footer">
                            <p>Grazie per aver scelto Barber Shop</p>
                            <p>Questo è un messaggio automatico, per favore non rispondere a questa email.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """, customerName, position);
    }
    
    /**
     * Format date for display
     */
    private String formatDate(String dateStr) {
        try {
            LocalDate date = LocalDate.parse(dateStr);
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy (EEEE)");
            return date.format(formatter);
        } catch (Exception e) {
            return dateStr;
        }
    }
}
