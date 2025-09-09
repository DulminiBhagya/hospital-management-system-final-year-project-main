package com.HMS.HMS.service;

import com.HMS.HMS.DTO.PatientDTO.PatientRequestDTO;
import com.HMS.HMS.DTO.PatientDTO.PatientResponseDTO;
import com.HMS.HMS.model.Patient.Patient;
import com.HMS.HMS.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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
        patient.setFirstName(dto.getFirstName());
        patient.setLastName(dto.getLastName());
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

    public PatientResponseDTO getPatientByNationalId(Long nationalId){
        Patient patient = patientRepository.findByNationalId(nationalId);
        if (patient != null){
            return convertToResponseDTO(patient);
        } else {
            throw new RuntimeException("Patient not found with National ID: " + nationalId);
        }
    }

    public List<PatientResponseDTO> searchPatientsByName(String name){
        List<Patient> patients = patientRepository.findByFullNameContainingIgnoreCase(name);
        return patients.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<PatientResponseDTO> searchPatientsByFirstName(String firstName){
        List<Patient> patients = patientRepository.findByFirstNameContainingIgnoreCase(firstName);
        return patients.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<PatientResponseDTO> searchPatientsByLastName(String lastName){
        List<Patient> patients = patientRepository.findByLastNameContainingIgnoreCase(lastName);
        return patients.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public void updatePatient(Long nationalId, PatientRequestDTO dto){
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
        existingPatient.setFirstName(dto.getFirstName());
        existingPatient.setLastName(dto.getLastName());
        existingPatient.setAddress(dto.getAddress());
        existingPatient.setDateOfBirth(dto.getDateOfBirth());
        existingPatient.setContactNumber(dto.getContactNumber());
        existingPatient.setEmergencyContactNumber(dto.getEmergencyContactNumber());
        existingPatient.setGender(dto.getGender());

        patientRepository.save(existingPatient);
    }

    public void deletePatient(Long nationalId){
        Patient patient = patientRepository.findByNationalId(nationalId);
        if (patient == null){
            throw new RuntimeException("Patient not found with National ID: " + nationalId);
        }
        patientRepository.delete(patient);
    }

    private PatientResponseDTO convertToResponseDTO(Patient patient){
        return new PatientResponseDTO(
                patient.getNationalId(),
                patient.getFirstName(),
                patient.getLastName(),
                patient.getAddress(),
                patient.getDateOfBirth(),
                patient.getContactNumber(),
                patient.getEmergencyContactNumber(),
                patient.getGender(),
                patient.getRegistrationDate()
        );
    }
}