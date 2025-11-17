package com.example.demo.service;

import com.example.demo.model.BusinessHours;
import com.example.demo.repository.BusinessHoursRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class BusinessHoursService {

    @Autowired
    private BusinessHoursRepository businessHoursRepository;

    public List<BusinessHours> getBusinessHours() {
        List<BusinessHours> hours = businessHoursRepository.findAll();

        if (hours.isEmpty()) {
            hours = createDefaultHours();
            businessHoursRepository.saveAll(hours);
        }

        hours.sort(Comparator.comparingInt(BusinessHours::getGiorno));
        return hours;
    }

    @Transactional
    public List<BusinessHours> updateBusinessHours(List<BusinessHours> updatedHours) {
        List<BusinessHours> result = new ArrayList<>();

        for (BusinessHours incoming : updatedHours) {
            validateBusinessHour(incoming);

            BusinessHours entity = businessHoursRepository.findByGiorno(incoming.getGiorno())
                    .orElseGet(() -> {
                        BusinessHours newEntry = new BusinessHours();
                        newEntry.setGiorno(incoming.getGiorno());
                        return newEntry;
                    });

            entity.setAperto(incoming.isAperto());
            entity.setApertura(incoming.isAperto() ? incoming.getApertura() : null);
            entity.setChiusura(incoming.isAperto() ? incoming.getChiusura() : null);

            result.add(businessHoursRepository.save(entity));
        }

        result.sort(Comparator.comparingInt(BusinessHours::getGiorno));
        return result;
    }

    private List<BusinessHours> createDefaultHours() {
        List<BusinessHours> defaults = new ArrayList<>();

        for (int day = 0; day < 7; day++) {
            BusinessHours entry = new BusinessHours();
            entry.setGiorno(day);
            if (day == 0) {
                entry.setAperto(false);
            } else {
                entry.setAperto(true);
                entry.setApertura(LocalTime.of(9, 0));
                entry.setChiusura(LocalTime.of(19, 0));
            }
            defaults.add(entry);
        }

        return defaults;
    }

    private void validateBusinessHour(BusinessHours hours) {
        if (hours.isAperto()) {
            if (hours.getApertura() == null || hours.getChiusura() == null) {
                throw new IllegalArgumentException("Orari di apertura e chiusura obbligatori per i giorni aperti");
            }

            if (!hours.getApertura().isBefore(hours.getChiusura())) {
                throw new IllegalArgumentException("L'orario di apertura deve essere precedente a quello di chiusura");
            }
        }
    }
}
