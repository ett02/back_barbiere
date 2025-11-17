package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalTime;

@Data
@Entity
@Table(name = "shop_hours")
public class BusinessHours {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Giorno della settimana espresso come intero.
     * 0 = Domenica, 1 = Lunedì, ..., 6 = Sabato
     */
    @Column(nullable = false, unique = true)
    private Integer giorno;

    @Column(name = "is_chiuso", nullable = false)
    @JsonIgnore
    private boolean chiuso;

    @Column(name = "orario_apertura")
    private LocalTime apertura;

    @Column(name = "orario_chiusura")
    private LocalTime chiusura;

    @JsonProperty("aperto")
    public boolean isAperto() {
        return !chiuso;
    }

    @JsonProperty("aperto")
    public void setAperto(boolean aperto) {
        this.chiuso = !aperto;
    }
}
