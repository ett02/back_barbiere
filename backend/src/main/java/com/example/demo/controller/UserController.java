package com.example.demo.controller;

import com.example.demo.dto.UserProfileDTO;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDTO> getProfile(Principal principal) {
        String email = principal.getName();
        UserProfileDTO profile = userService.getUserProfile(email);
        if (profile != null) {
            return ResponseEntity.ok(profile);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileDTO> updateProfile(Principal principal, @RequestBody UserProfileDTO dto) {
        String email = principal.getName();
        UserProfileDTO updatedProfile = userService.updateUserProfile(email, dto);
        if (updatedProfile != null) {
            return ResponseEntity.ok(updatedProfile);
        }
        return ResponseEntity.notFound().build();
    }
}
