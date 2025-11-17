package com.example.demo.controller;

import com.example.demo.model.BusinessHours;
import com.example.demo.service.BusinessHoursService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/business-hours")
public class BusinessHoursController {

    @Autowired
    private BusinessHoursService businessHoursService;

    @GetMapping
    public List<BusinessHours> getBusinessHours() {
        return businessHoursService.getBusinessHours();
    }

    @PutMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<BusinessHours>> updateBusinessHours(@RequestBody List<BusinessHours> hours) {
        return ResponseEntity.ok(businessHoursService.updateBusinessHours(hours));
    }
}
