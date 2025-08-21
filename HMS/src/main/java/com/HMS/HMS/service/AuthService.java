package com.HMS.HMS.service;

import com.HMS.HMS.DTO.authDTO.AuthRequest;
import com.HMS.HMS.DTO.authDTO.AuthResponse;
import com.HMS.HMS.DTO.authDTO.UpdateUserRequestDTO;
import com.HMS.HMS.DTO.authDTO.getAllUsersDTO;
import com.HMS.HMS.Exception_Handler.EmployeeIdAlreadyExistsException;
import com.HMS.HMS.Exception_Handler.InvalidPasswordException;
import com.HMS.HMS.Exception_Handler.UserNotFoundException;
import com.HMS.HMS.model.User.Role;
import com.HMS.HMS.model.User.User;
import com.HMS.HMS.repository.UserRepository;
import com.HMS.HMS.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public AuthResponse login(AuthRequest request){
        User user = userRepository.findByEmpId(request.getEmpId())
                .orElseThrow(() -> new UserNotFoundException("Invalid credentials. Please check your employee ID and password."));

        if(!passwordEncoder.matches(request.getPassword(),user.getPassword())){
            throw new InvalidPasswordException("Invalid credentials. Please check your employee ID and password.");
        }

        String token = jwtUtil.generateToken(user.getEmpId(),user.getRole().name());
        return new AuthResponse(true,"Login successful",token);
    }

    public void register(User user){
        if(userRepository.existsById(user.getEmpId())){
            throw new EmployeeIdAlreadyExistsException("Employee ID already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
    }

    public List<getAllUsersDTO> getAllUsers(){
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(user -> new getAllUsersDTO(
                        user.getEmpId(),
                        user.getUsername(),
                        user.getRole().name()
                ))
                .collect(Collectors.toList());
    }

    public void updateUser(String empId, UpdateUserRequestDTO updateRequest){
        User user = userRepository.findByEmpId(empId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (updateRequest.getUsername() != null && !updateRequest.getUsername().isEmpty()) {
            user.setUsername(updateRequest.getUsername());
        }

        if (updateRequest.getPassword() != null && !updateRequest.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(updateRequest.getPassword()));
        }

        if (updateRequest.getRole() != null && !updateRequest.getRole().isEmpty()) {
            user.setRole(Role.valueOf(updateRequest.getRole()));
        }

        userRepository.save(user);
    }

    public void deleteUser(String empId) {
        User user = userRepository.findByEmpId(empId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        userRepository.delete(user);
    }


}
