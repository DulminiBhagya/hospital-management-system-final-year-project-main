package com.HMS.HMS.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.HMS.HMS.DTO.CommonResponseDTO;
import com.HMS.HMS.model.Doctor.Doctor;
import com.HMS.HMS.service.DoctorService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = "http://localhost:5173")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    // ===============================================
    // GET ALL DOCTORS
    // ===============================================
    @GetMapping
    public ResponseEntity<CommonResponseDTO> getAllDoctors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            @RequestParam(defaultValue = "firstName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        try {
            Map<String, Object> responseData = new HashMap<>();
            
            if (size > 100) { // Get all doctors without pagination
                List<Doctor> doctors = doctorService.getActiveDoctors();
                responseData.put("data", doctors);
                responseData.put("count", doctors.size());
            } else {
                Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                           Sort.by(sortBy).descending() : 
                           Sort.by(sortBy).ascending();
                
                Pageable pageable = PageRequest.of(page, size, sort);
                Page<Doctor> doctorPage = doctorService.getDoctorsWithPagination(pageable);
                
                responseData.put("data", doctorPage.getContent());
                responseData.put("count", (int) doctorPage.getTotalElements());
                responseData.put("totalPages", doctorPage.getTotalPages());
                responseData.put("currentPage", page);
            }
            
            return ResponseEntity.ok(new CommonResponseDTO(true, "Doctors retrieved successfully", responseData));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new CommonResponseDTO(false, "Failed to retrieve doctors: " + e.getMessage(), null));
        }
    }

    // ===============================================
    // GET DOCTOR BY ID
    // ===============================================
    @GetMapping("/{id}")
    public ResponseEntity<CommonResponseDTO> getDoctorById(@PathVariable Long id) {
        try {
            Doctor doctor = doctorService.getDoctorById(id);
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("doctor", doctor);
            return ResponseEntity.ok(new CommonResponseDTO(true, "Doctor retrieved successfully", responseData));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new CommonResponseDTO(false, e.getMessage(), null));
        }
    }

    // ===============================================
    // CREATE NEW DOCTOR
    // ===============================================
    @PostMapping
    public ResponseEntity<CommonResponseDTO> createDoctor(@Valid @RequestBody Doctor doctor, BindingResult bindingResult) {
        try {
            // Check for validation errors
            if (bindingResult.hasErrors()) {
                Map<String, Object> errors = new HashMap<>();
                bindingResult.getFieldErrors().forEach(error -> 
                    errors.put(error.getField(), error.getDefaultMessage())
                );
                
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new CommonResponseDTO(false, "Validation failed", errors));
            }

            Doctor createdDoctor = doctorService.createDoctor(doctor);
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("doctor", createdDoctor);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new CommonResponseDTO(true, "Doctor created successfully", responseData));
        } catch (Exception e) {
            HttpStatus status = e.getMessage().contains("already exists") ? 
                               HttpStatus.CONFLICT : HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(status)
                    .body(new CommonResponseDTO(false, e.getMessage(), null));
        }
    }

    // ===============================================
    // UPDATE DOCTOR
    // ===============================================
    @PutMapping("/{id}")
    public ResponseEntity<CommonResponseDTO> updateDoctor(@PathVariable Long id, 
                                                         @Valid @RequestBody Doctor doctorDetails,
                                                         BindingResult bindingResult) {
        try {
            // Check for validation errors
            if (bindingResult.hasErrors()) {
                Map<String, Object> errors = new HashMap<>();
                bindingResult.getFieldErrors().forEach(error -> 
                    errors.put(error.getField(), error.getDefaultMessage())
                );
                
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new CommonResponseDTO(false, "Validation failed", errors));
            }

            Doctor updatedDoctor = doctorService.updateDoctor(id, doctorDetails);
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("doctor", updatedDoctor);
            return ResponseEntity.ok(new CommonResponseDTO(true, "Doctor updated successfully", responseData));
        } catch (Exception e) {
            HttpStatus status = e.getMessage().contains("not found") ? 
                               HttpStatus.NOT_FOUND : 
                               e.getMessage().contains("already exists") ? 
                               HttpStatus.CONFLICT : HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(status)
                    .body(new CommonResponseDTO(false, e.getMessage(), null));
        }
    }

    // ===============================================
    // DELETE DOCTOR (SOFT DELETE)
    // ===============================================
    @DeleteMapping("/{id}")
    public ResponseEntity<CommonResponseDTO> deleteDoctor(@PathVariable Long id) {
        try {
            doctorService.deleteDoctor(id);
            return ResponseEntity.ok(new CommonResponseDTO(true, "Doctor deleted successfully"));
        } catch (Exception e) {
            HttpStatus status = e.getMessage().contains("not found") ? 
                               HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR;
            return ResponseEntity.status(status)
                    .body(new CommonResponseDTO(false, e.getMessage(), null));
        }
    }

    // ===============================================
    // SEARCH DOCTORS
    // ===============================================
    @GetMapping("/search")
    public ResponseEntity<CommonResponseDTO> searchDoctors(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) String department) {
        try {
            List<Doctor> doctors;
            
            if ((specialization != null && !specialization.isEmpty()) || 
                (department != null && !department.isEmpty())) {
                // Advanced search with filters
                doctors = doctorService.searchDoctorsWithFilters(query, specialization, department);
            } else {
                // Simple search
                doctors = doctorService.searchDoctors(query);
            }
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("data", doctors);
            responseData.put("count", doctors.size());
            
            return ResponseEntity.ok(new CommonResponseDTO(true, "Search completed successfully", responseData));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new CommonResponseDTO(false, "Search failed: " + e.getMessage(), null));
        }
    }

    // ===============================================
    // GET DOCTORS BY SPECIALIZATION
    // ===============================================
    @GetMapping("/specialization/{specialization}")
    public ResponseEntity<CommonResponseDTO> getDoctorsBySpecialization(@PathVariable String specialization) {
        try {
            List<Doctor> doctors = doctorService.getDoctorsBySpecialization(specialization);
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("data", doctors);
            responseData.put("count", doctors.size());
            
            return ResponseEntity.ok(new CommonResponseDTO(true, "Doctors retrieved successfully", responseData));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new CommonResponseDTO(false, "Failed to retrieve doctors: " + e.getMessage(), null));
        }
    }

    // ===============================================
    // GET DOCTORS BY DEPARTMENT
    // ===============================================
    @GetMapping("/department/{department}")
    public ResponseEntity<CommonResponseDTO> getDoctorsByDepartment(@PathVariable String department) {
        try {
            List<Doctor> doctors = doctorService.getDoctorsByDepartment(department);
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("data", doctors);
            responseData.put("count", doctors.size());
            
            return ResponseEntity.ok(new CommonResponseDTO(true, "Doctors retrieved successfully", responseData));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new CommonResponseDTO(false, "Failed to retrieve doctors: " + e.getMessage(), null));
        }
    }

    // ===============================================
    // GET DOCTOR STATISTICS
    // ===============================================
    @GetMapping("/statistics")
    public ResponseEntity<CommonResponseDTO> getDoctorStatistics() {
        try {
            Map<String, Object> statistics = doctorService.getDoctorStatistics();
            return ResponseEntity.ok(new CommonResponseDTO(true, "Statistics retrieved successfully", statistics));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new CommonResponseDTO(false, "Failed to retrieve statistics: " + e.getMessage(), null));
        }
    }

    // ===============================================
    // GET DOCTOR BY EMPLOYEE ID
    // ===============================================
    @GetMapping("/emp/{empId}")
    public ResponseEntity<CommonResponseDTO> getDoctorByEmpId(@PathVariable String empId) {
        try {
            Optional<Doctor> doctor = doctorService.getDoctorByEmpId(empId);
            
            if (doctor.isPresent()) {
                Map<String, Object> responseData = new HashMap<>();
                responseData.put("doctor", doctor.get());
                return ResponseEntity.ok(new CommonResponseDTO(true, "Doctor found", responseData));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new CommonResponseDTO(false, "Doctor not found with employee ID: " + empId, null));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new CommonResponseDTO(false, "Error retrieving doctor: " + e.getMessage(), null));
        }
    }

    // Add this method to your DoctorController class

// ===============================================
// GET ALL ACTIVE DOCTORS (SIMPLE VERSION)
// ===============================================
@GetMapping("/all")
public ResponseEntity<CommonResponseDTO> getAllActiveDoctors() {
    try {
        List<Doctor> doctors = doctorService.getActiveDoctors();
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("doctors", doctors);
        responseData.put("count", doctors.size());
        
        return ResponseEntity.ok(new CommonResponseDTO(true, "All active doctors retrieved successfully", responseData));
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new CommonResponseDTO(false, "Failed to retrieve doctors: " + e.getMessage(), null));
    }
}
}