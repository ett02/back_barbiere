package com.example.demo.repository;

import com.example.demo.model.Availability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, Long> {
    List<Availability> findByBarberId(Long barberId);
    List<Availability> findByBarberIdAndGiorno(Long barberId, Integer giorno);
}
