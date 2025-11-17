package com.example.demo.repository;

import com.example.demo.model.BusinessHours;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BusinessHoursRepository extends JpaRepository<BusinessHours, Long> {
    Optional<BusinessHours> findByGiorno(Integer giorno);
}
