package com.example.demo.dto;

import com.example.demo.model.Users;

public class UserResponseDTO {
    private Long id;
    private String nome;
    private String cognome;
    private String email;
    private String telefono;
    private Users.Role ruolo;

    public UserResponseDTO(Users user) {
        this.id = user.getId();
        this.nome = user.getNome();
        this.cognome = user.getCognome();
        this.email = user.getEmail();
        this.telefono = user.getTelefono();
        this.ruolo = user.getRuolo();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getCognome() { return cognome; }
    public void setCognome(String cognome) { this.cognome = cognome; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public Users.Role getRuolo() { return ruolo; }
    public void setRuolo(Users.Role ruolo) { this.ruolo = ruolo; }
}
