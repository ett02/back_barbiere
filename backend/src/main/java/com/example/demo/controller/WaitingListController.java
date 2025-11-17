package com.example.demo.controller;

import com.example.demo.dto.WaitingListRequest;
import com.example.demo.model.WaitingList;
import com.example.demo.service.WaitingListService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/waiting-list")
public class WaitingListController {

    @Autowired
    private WaitingListService waitingListService;

    @PostMapping
    public ResponseEntity<WaitingList> addToWaitingList(@RequestBody WaitingListRequest request) {
        return ResponseEntity.ok(waitingListService.addToWaitingList(request));
    }

    @GetMapping("/customer/{customerId}")
    public List<WaitingList> getWaitingListByCustomer(@PathVariable Long customerId) {
        return waitingListService.getWaitingListByCustomer(customerId);
    }

    @GetMapping("/barber/{barberId}")
    public List<WaitingList> getWaitingListByBarberAndDate(
            @PathVariable Long barberId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return waitingListService.getActiveWaitingListByBarberAndDate(barberId, date);
    }

    @GetMapping("/{id}/position")
    public ResponseEntity<Integer> getPositionInQueue(@PathVariable Long id) {
        Integer position = waitingListService.getPositionInQueue(id);
        if (position != null) {
            return ResponseEntity.ok(position);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelWaitingListEntry(@PathVariable Long id) {
        waitingListService.cancelWaitingListEntry(id);
        return ResponseEntity.noContent().build();
    }
}
