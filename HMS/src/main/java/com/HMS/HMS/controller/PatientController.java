package com.HMS.HMS.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.HMS.HMS.DTO.CommonResponseDTO;
import com.HMS.HMS.DTO.PatientDTO.PatientRequestDTO;
import com.HMS.HMS.DTO.PatientDTO.PatientResponseDTO;
import com.HMS.HMS.service.PatientService;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @PostMapping("/register")
    public CommonResponseDTO addPatient(@RequestBody PatientRequestDTO patientRequestDTO){
        try{
            patientService.addPatient(patientRequestDTO);
            return new CommonResponseDTO(true,"Patient added successfully.");
        }catch (RuntimeException e){
            return new CommonResponseDTO(false,e.getMessage());
        }
    }

    @GetMapping("/all")
    public ResponseEntity <List<PatientResponseDTO>> getAllPatients(){
        try{
            List<PatientResponseDTO> patients = patientService.getAllPatients();
            return ResponseEntity.ok(patients);
        }catch (Exception e){
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{nationalId}")
    public CommonResponseDTO updatePatient(@PathVariable String nationalId, @RequestBody PatientRequestDTO patientRequestDTO){
        try{
            patientService.updatePatient(nationalId,patientRequestDTO);
            return new CommonResponseDTO(true,"Patient updated successfully.");
        }catch (RuntimeException e){
            return new CommonResponseDTO(false, e.getMessage());
        }
    }

    @DeleteMapping("/{nationalId}")
    public CommonResponseDTO deletePatient(@PathVariable String nationalId){
        try{
            patientService.deletePatient(nationalId);
            return new CommonResponseDTO(true,"Patient deleted successfully.");
        }catch (RuntimeException e){
            return new CommonResponseDTO(false,e.getMessage());
        }
    }
}
