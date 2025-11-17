package com.example.demo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "barbers")
public class Barbers {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    private String cognome;

    private String esperienza;

    @Column(name = "specialità")  // Nome campo DB con accento
    private String specialita;    // Property Java senza accento per Angular

    private Boolean isActive;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private Users user;
}
