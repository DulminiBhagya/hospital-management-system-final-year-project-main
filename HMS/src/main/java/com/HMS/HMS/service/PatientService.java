package com.HMS.HMS.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.HMS.HMS.DTO.PatientDTO.PatientRequestDTO;
import com.HMS.HMS.DTO.PatientDTO.PatientResponseDTO;
import com.HMS.HMS.model.Patient.Patient;
import com.HMS.HMS.repository.PatientRepository;

@Service
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    public void addPatient(PatientRequestDTO dto){
        if (patientRepository.existsByNationalId(dto.getNationalId())){
            throw new RuntimeException("Patient with this National ID already exists.");
        }

        Patient patient = new Patient();

        patient.setNationalId(dto.getNationalId());
        patient.setFullName(dto.getFullName());
        patient.setAddress(dto.getAddress());
        patient.setDateOfBirth(dto.getDateOfBirth());
        patient.setContactNumber(dto.getContactNumber());
        patient.setEmergencyContactNumber(dto.getEmergencyContactNumber());
        patient.setGender(dto.getGender());

        patientRepository.save(patient);
    }

    public List<PatientResponseDTO> getAllPatients(){
        List<Patient> patients = patientRepository.findAll();
        return patients.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public PatientResponseDTO getPatientByNationalId(String nationalId){
        Patient patient = patientRepository.findByNationalId(nationalId);
        if (patient != null){
            return convertToResponseDTO(patient);
        } else {
            throw new RuntimeException("Patient not found with National ID: " + nationalId);
        }
    }

    public void updatePatient(String nationalId, PatientRequestDTO dto){
        Patient existingPatient = patientRepository.findByNationalId(nationalId);
        if (existingPatient == null){
            throw new RuntimeException("Patient not found with National ID: " + nationalId);
        }

        // Check if the national ID is being changed and if it already exists
        if (!existingPatient.getNationalId().equals(dto.getNationalId())) {
            if (patientRepository.existsByNationalId(dto.getNationalId())) {
                throw new RuntimeException("Patient with this National ID already exists.");
            }
        }

        // Update patient fields
        existingPatient.setNationalId(dto.getNationalId());
        existingPatient.setFullName(dto.getFullName());
        existingPatient.setAddress(dto.getAddress());
        existingPatient.setDateOfBirth(dto.getDateOfBirth());
        existingPatient.setContactNumber(dto.getContactNumber());
        existingPatient.setEmergencyContactNumber(dto.getEmergencyContactNumber());
        existingPatient.setGender(dto.getGender());

        patientRepository.save(existingPatient);
    }

    public void deletePatient(String nationalId){
        Patient patient = patientRepository.findByNationalId(nationalId);
        if (patient == null){
            throw new RuntimeException("Patient not found with National ID: " + nationalId);
        }
        patientRepository.delete(patient);
    }

    private PatientResponseDTO convertToResponseDTO(Patient patient){
        return new PatientResponseDTO(
                patient.getId(),
                patient.getNationalId(),
                patient.getFullName(),
                patient.getAddress(),
                patient.getDateOfBirth(),
                patient.getContactNumber(),
                patient.getEmergencyContactNumber(),
                patient.getGender(),
                patient.getRegistrationDate()
        );
    }
}