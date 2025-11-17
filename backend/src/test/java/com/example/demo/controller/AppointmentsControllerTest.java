package com.example.demo.controller;

import com.example.demo.dto.AppointmentRequest;
import com.example.demo.model.Appointments;
import com.example.demo.model.Barbers;
import com.example.demo.model.Services;
import com.example.demo.model.Users;
import com.example.demo.repository.BarbersRepository;
import com.example.demo.repository.ServicesRepository;
import com.example.demo.repository.UsersRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AppointmentsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private BarbersRepository barbersRepository;

    @Autowired
    private ServicesRepository servicesRepository;

    private Users user;
    private Barbers barber;
    private Services service;

    @BeforeEach
    void setUp() {
        user = new Users();
        user.setEmail("test@test.com");
        user.setPassword("password");
        user = usersRepository.save(user);

        barber = new Barbers();
        barber.setNome("Test Barber");
        barber = barbersRepository.save(barber);

        service = new Services();
        service.setNome("Test Service");
        service.setDurata(30);
        service = servicesRepository.save(service);
    }

    @Test
    @WithMockUser
    void createAppointment_shouldCreateAppointment() throws Exception {
        AppointmentRequest appointmentRequest = new AppointmentRequest();
        appointmentRequest.setCustomerId(user.getId());
        appointmentRequest.setBarberId(barber.getId());
        appointmentRequest.setServiceId(service.getId());
        appointmentRequest.setData(LocalDate.now());
        appointmentRequest.setOrarioInizio(LocalTime.of(10, 0));

        mockMvc.perform(post("/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(appointmentRequest)))
                .andExpect(status().isOk());
    }
}
