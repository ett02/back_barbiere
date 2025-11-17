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
        hours = removeDuplicateDays(hours);

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

            BusinessHours entity = findOrCreateUniqueEntry(incoming.getGiorno());

            entity.setAperto(incoming.isAperto());
            entity.setApertura(incoming.isAperto() ? incoming.getApertura() : null);
            entity.setChiusura(incoming.isAperto() ? incoming.getChiusura() : null);

            result.add(businessHoursRepository.save(entity));
        }

        result.sort(Comparator.comparingInt(BusinessHours::getGiorno));
        return result;
    }

    private List<BusinessHours> removeDuplicateDays(List<BusinessHours> entries) {
        if (entries.isEmpty()) {
            return entries;
        }

        List<BusinessHours> uniqueEntries = new ArrayList<>();
        List<BusinessHours> duplicates = new ArrayList<>();

        entries.sort(Comparator.comparingInt(BusinessHours::getGiorno));

        Integer currentDay = null;
        for (BusinessHours entry : entries) {
            if (currentDay == null || !currentDay.equals(entry.getGiorno())) {
                uniqueEntries.add(entry);
                currentDay = entry.getGiorno();
            } else {
                duplicates.add(entry);
            }
        }

        if (!duplicates.isEmpty()) {
            businessHoursRepository.deleteAll(duplicates);
        }

        return uniqueEntries;
    }

    private BusinessHours findOrCreateUniqueEntry(Integer giorno) {
        List<BusinessHours> matches = businessHoursRepository.findAllByGiorno(giorno);

        if (matches.isEmpty()) {
            BusinessHours newEntry = new BusinessHours();
            newEntry.setGiorno(giorno);
            return newEntry;
        }

        matches.sort(Comparator.comparing(BusinessHours::getId, Comparator.nullsLast(Long::compareTo)));

        BusinessHours entity = matches.get(0);
        if (matches.size() > 1) {
            List<BusinessHours> duplicates = new ArrayList<>(matches.subList(1, matches.size()));
            businessHoursRepository.deleteAll(duplicates);
        }

        return entity;
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
