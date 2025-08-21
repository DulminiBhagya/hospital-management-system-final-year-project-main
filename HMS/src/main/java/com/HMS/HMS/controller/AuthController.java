package com.HMS.HMS.controller;

import com.HMS.HMS.DTO.*;
import com.HMS.HMS.DTO.authDTO.*;
import com.HMS.HMS.model.User.User;
import com.HMS.HMS.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request){
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponseDTO> register(@RequestBody User user){
        authService.register(user);
        RegisterResponseDTO response = new RegisterResponseDTO(true,"User registered successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/allUsers")
    public ResponseEntity<List<getAllUsersDTO>> getAllUsers(){
        List<getAllUsersDTO> users = authService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PatchMapping("/update/{empId}")
    public ResponseEntity<CommonResponseDTO> updateUser(
            @PathVariable String empId,
            @RequestBody UpdateUserRequestDTO updateRequest) {

        authService.updateUser(empId, updateRequest);
        CommonResponseDTO response = new CommonResponseDTO(true, "User updated successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/delete/{empId}")
    public ResponseEntity<CommonResponseDTO> deleteUser(@PathVariable String empId) {
        authService.deleteUser(empId);
        CommonResponseDTO response = new CommonResponseDTO(true, "User deleted successfully");
        return ResponseEntity.ok(response);
    }



}
