package com.HMS.HMS.service;

import com.HMS.HMS.DTO.AdmissionDTO.AdmissionRequestDTO;
import com.HMS.HMS.DTO.AdmissionDTO.AdmissionResponseDTO;
import com.HMS.HMS.model.Admission.Admission;
import com.HMS.HMS.model.Admission.AdmissionStatus;
import com.HMS.HMS.model.Patient.Patient;
import com.HMS.HMS.model.ward.Ward;
import com.HMS.HMS.repository.AdmissionRepository;
import com.HMS.HMS.repository.PatientRepository;
import com.HMS.HMS.repository.WardRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdmissionService {

    private final AdmissionRepository admissionRepository;
    private final PatientRepository patientRepository;
    private final WardRepository wardRepository;

    public AdmissionService(AdmissionRepository admissionRepository, PatientRepository patientRepository, WardRepository wardRepository) {
        this.admissionRepository = admissionRepository;
        this.patientRepository = patientRepository;
        this.wardRepository = wardRepository;
    }

    public AdmissionResponseDTO admitPatient(AdmissionRequestDTO request) {
        // Validate patient exists
        Optional<Patient> patientOpt = patientRepository.findById(request.getPatientNationalId());
        if (patientOpt.isEmpty()) {
            throw new IllegalArgumentException("Patient with National ID " + request.getPatientNationalId() + " not found");
        }
        Patient patient = patientOpt.get();

        // Check if patient is already admitted
        if (patient.isCurrentlyAdmitted()) {
            throw new IllegalArgumentException("Patient is already admitted");
        }

        // Validate ward exists
        Optional<Ward> wardOpt = wardRepository.findById(request.getWardId());
        if (wardOpt.isEmpty()) {
            throw new IllegalArgumentException("Ward with ID " + request.getWardId() + " not found");
        }
        Ward ward = wardOpt.get();

        // Validate bed number is provided
        if (request.getBedNumber() == null || request.getBedNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("Bed number is required");
        }

        // Check if bed is already occupied
        if (isBedOccupied(request.getWardId(), request.getBedNumber())) {
            throw new IllegalArgumentException("Bed " + request.getBedNumber() + " in ward " + ward.getWardName() + " is already occupied");
        }

        // Create new admission
        Admission admission = new Admission(patient, ward, request.getBedNumber().trim());
        admission.setStatus(AdmissionStatus.ACTIVE);

        Admission savedAdmission = admissionRepository.save(admission);

        // Update relationships
        patient.addAdmission(savedAdmission);
        ward.addAdmission(savedAdmission);

        return convertToResponseDTO(savedAdmission);
    }

    public AdmissionResponseDTO dischargePatient(Long admissionId) {
        Admission admission = getAdmissionByIdOrThrow(admissionId);

        if (admission.getStatus() != AdmissionStatus.ACTIVE) {
            throw new IllegalStateException("Patient is not currently admitted");
        }

        admission.setStatus(AdmissionStatus.DISCHARGED);
        admission.setDischargeDate(LocalDateTime.now());

        Admission savedAdmission = admissionRepository.save(admission);
        return convertToResponseDTO(savedAdmission);
    }

    public AdmissionResponseDTO transferPatient(Long admissionId, Long newWardId, String newBedNumber) {
        Admission currentAdmission = getAdmissionByIdOrThrow(admissionId);

        if (currentAdmission.getStatus() != AdmissionStatus.ACTIVE) {
            throw new IllegalStateException("Patient is not currently admitted");
        }

        Optional<Ward> newWardOpt = wardRepository.findById(newWardId);
        if (newWardOpt.isEmpty()) {
            throw new IllegalArgumentException("Ward with ID " + newWardId + " not found");
        }
        Ward newWard = newWardOpt.get();

        // Validate bed number is provided
        if (newBedNumber == null || newBedNumber.trim().isEmpty()) {
            throw new IllegalArgumentException("Bed number is required for transfer");
        }

        // Check if new bed is already occupied
        if (isBedOccupied(newWardId, newBedNumber)) {
            throw new IllegalArgumentException("Bed " + newBedNumber + " in ward " + newWard.getWardName() + " is already occupied");
        }

        // Mark current admission as transferred
        currentAdmission.setStatus(AdmissionStatus.TRANSFERRED);
        currentAdmission.setDischargeDate(LocalDateTime.now());
        admissionRepository.save(currentAdmission);

        // Create new admission in the new ward
        Admission newAdmission = new Admission(currentAdmission.getPatient(), newWard, newBedNumber.trim());
        newAdmission.setStatus(AdmissionStatus.ACTIVE);

        Admission savedAdmission = admissionRepository.save(newAdmission);

        // Update relationships
        currentAdmission.getPatient().addAdmission(savedAdmission);
        newWard.addAdmission(savedAdmission);

        return convertToResponseDTO(savedAdmission);
    }

    public List<AdmissionResponseDTO> getAllAdmissions() {
        return admissionRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<AdmissionResponseDTO> getAdmissionsByPatient(Long nationalId) {
        return admissionRepository.findByPatientNationalId(nationalId)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<AdmissionResponseDTO> getAdmissionsByWard(Long wardId) {
        return admissionRepository.findByWardWardId(wardId)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<AdmissionResponseDTO> getActiveAdmissions() {
        return admissionRepository.findByStatus(AdmissionStatus.ACTIVE)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public Optional<AdmissionResponseDTO> getAdmissionById(Long admissionId) {
        return admissionRepository.findById(admissionId)
                .map(this::convertToResponseDTO);
    }

    public List<String> getAvailableBedsInWard(Long wardId) {
        // This method would need to be implemented based on your bed management logic
        // For now, it returns occupied beds so you can determine available ones
        return admissionRepository.findOccupiedBedsByWard(wardId);
    }

    private boolean isBedOccupied(Long wardId, String bedNumber) {
        return admissionRepository.existsByWardWardIdAndBedNumberAndStatus(wardId, bedNumber.trim(), AdmissionStatus.ACTIVE);
    }

    private Admission getAdmissionByIdOrThrow(Long admissionId) {
        Optional<Admission> admissionOpt = admissionRepository.findById(admissionId);
        if (admissionOpt.isEmpty()) {
            throw new IllegalArgumentException("Admission with ID " + admissionId + " not found");
        }
        return admissionOpt.get();
    }

    private AdmissionResponseDTO convertToResponseDTO(Admission admission) {
        return new AdmissionResponseDTO(
                admission.getAdmissionId(),
                admission.getPatient().getNationalId(),
                admission.getPatient().getFullName(),
                admission.getWard().getWardId(),
                admission.getWard().getWardName(),
                admission.getBedNumber(),
                admission.getAdmissionDate(),
                admission.getDischargeDate(),
                admission.getStatus()
        );
    }
}