package com.example.demo.service;

import com.example.demo.dto.UserProfileDTO;
import com.example.demo.model.Users;
import com.example.demo.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UsersRepository usersRepository;

    public UserProfileDTO getUserProfile(String email) {
        Optional<Users> userOpt = usersRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            Users user = userOpt.get();
            UserProfileDTO dto = new UserProfileDTO();
            dto.setNome(user.getNome());
            dto.setCognome(user.getCognome());
            dto.setEmail(user.getEmail());
            dto.setTelefono(user.getTelefono());
            return dto;
        }
        return null;
    }

    public UserProfileDTO updateUserProfile(String email, UserProfileDTO dto) {
        Optional<Users> userOpt = usersRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            Users user = userOpt.get();
            user.setNome(dto.getNome());
            user.setCognome(dto.getCognome());
            user.setTelefono(dto.getTelefono());
            // Email update is skipped for now to avoid auth issues
            
            usersRepository.save(user);
            
            return getUserProfile(email);
        }
        return null;
    }
}
