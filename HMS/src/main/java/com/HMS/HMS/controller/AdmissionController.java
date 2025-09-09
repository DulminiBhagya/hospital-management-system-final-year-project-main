package com.HMS.HMS.controller;

import com.HMS.HMS.DTO.AdmissionDTO.AdmissionRequestDTO;
import com.HMS.HMS.DTO.AdmissionDTO.AdmissionResponseDTO;
import com.HMS.HMS.service.AdmissionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admissions")
public class AdmissionController {

    private final AdmissionService admissionService;

    public AdmissionController(AdmissionService admissionService) {
        this.admissionService = admissionService;
    }

    @PostMapping("/admit")
    public ResponseEntity<?> admitPatient(@RequestBody AdmissionRequestDTO request) {
        try {
            AdmissionResponseDTO response = admissionService.admitPatient(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: Failed to admit patient - " + e.getMessage());
        }
    }

    @PutMapping("/discharge/{admissionId}")
    public ResponseEntity<?> dischargePatient(@PathVariable Long admissionId) {
        try {
            AdmissionResponseDTO response = admissionService.dischargePatient(admissionId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: Failed to discharge patient - " + e.getMessage());
        }
    }

    @PutMapping("/transfer/{admissionId}/ward/{wardId}/bed/{bedNumber}")
    public ResponseEntity<?> transferPatient(
            @PathVariable Long admissionId,
            @PathVariable Long wardId,
            @PathVariable String bedNumber) {
        try {
            AdmissionResponseDTO response = admissionService.transferPatient(admissionId, wardId, bedNumber);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: Failed to transfer patient - " + e.getMessage());
        }
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<AdmissionResponseDTO>> getAllAdmissions() {
        List<AdmissionResponseDTO> admissions = admissionService.getAllAdmissions();
        return ResponseEntity.ok(admissions);
    }

    @GetMapping("/active")
    public ResponseEntity<List<AdmissionResponseDTO>> getActiveAdmissions() {
        List<AdmissionResponseDTO> activeAdmissions = admissionService.getActiveAdmissions();
        return ResponseEntity.ok(activeAdmissions);
    }

    @GetMapping("/{admissionId}")
    public ResponseEntity<?> getAdmissionById(@PathVariable Long admissionId) {
        Optional<AdmissionResponseDTO> admission = admissionService.getAdmissionById(admissionId);
        if (admission.isPresent()) {
            return ResponseEntity.ok(admission.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/patient/{nationalId}")
    public ResponseEntity<List<AdmissionResponseDTO>> getAdmissionsByPatient(@PathVariable Long nationalId) {
        List<AdmissionResponseDTO> admissions = admissionService.getAdmissionsByPatient(nationalId);
        return ResponseEntity.ok(admissions);
    }

    @GetMapping("/ward/{wardId}")
    public ResponseEntity<List<AdmissionResponseDTO>> getAdmissionsByWard(@PathVariable Long wardId) {
        List<AdmissionResponseDTO> admissions = admissionService.getAdmissionsByWard(wardId);
        return ResponseEntity.ok(admissions);
    }

    @GetMapping("/ward/{wardId}/occupied-beds")
    public ResponseEntity<List<String>> getOccupiedBedsInWard(@PathVariable Long wardId) {
        List<String> occupiedBeds = admissionService.getAvailableBedsInWard(wardId);
        return ResponseEntity.ok(occupiedBeds);
    }
}