package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Entity
@Table(name = "appointments")
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Appointments {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Users customer;

    @ManyToOne
    @JoinColumn(name = "barber_id", nullable = false)
    private Barbers barber;

    @ManyToOne
    @JoinColumn(name = "service_id", nullable = false)
    private Services service;

    private LocalDate data;

    private LocalTime orarioInizio;

    @Enumerated(EnumType.STRING)
    @Column(name = "stato", nullable = false, length = 20)
    private StatoAppuntamento stato;

    public enum StatoAppuntamento {
        CONFERMATO,
        PENDING,
        ANNULLATO
    }
}
