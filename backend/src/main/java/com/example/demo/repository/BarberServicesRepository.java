package com.example.demo.repository;

import com.example.demo.model.BarberServices;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BarberServicesRepository extends JpaRepository<BarberServices, Long> {

    List<BarberServices> findByBarberId(Long barberId);

    List<BarberServices> findByServiceId(Long serviceId);

    void deleteByBarberId(Long barberId);
}
