package com.HMS.HMS.DTO.AdmissionDTO;

import com.HMS.HMS.model.Admission.AdmissionStatus;

import java.time.LocalDateTime;

public class AdmissionResponseDTO {
    private Long admissionId;
    private Long patientNationalId;
    private String patientName;
    private Long wardId;
    private String wardName;
    private String bedNumber;
    private LocalDateTime admissionDate;
    private LocalDateTime dischargeDate;
    private AdmissionStatus status;

    // Constructors
    public AdmissionResponseDTO() {}

    public AdmissionResponseDTO(Long admissionId, Long patientNationalId, String patientName,
                                Long wardId, String wardName, String bedNumber,
                                LocalDateTime admissionDate, LocalDateTime dischargeDate,
                                AdmissionStatus status) {
        this.admissionId = admissionId;
        this.patientNationalId = patientNationalId;
        this.patientName = patientName;
        this.wardId = wardId;
        this.wardName = wardName;
        this.bedNumber = bedNumber;
        this.admissionDate = admissionDate;
        this.dischargeDate = dischargeDate;
        this.status = status;
    }

    // Getters and Setters
    public Long getAdmissionId() {
        return admissionId;
    }

    public void setAdmissionId(Long admissionId) {
        this.admissionId = admissionId;
    }

    public Long getPatientNationalId() {
        return patientNationalId;
    }

    public void setPatientNationalId(Long patientNationalId) {
        this.patientNationalId = patientNationalId;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public Long getWardId() {
        return wardId;
    }

    public void setWardId(Long wardId) {
        this.wardId = wardId;
    }

    public String getWardName() {
        return wardName;
    }

    public void setWardName(String wardName) {
        this.wardName = wardName;
    }

    public String getBedNumber() {
        return bedNumber;
    }

    public void setBedNumber(String bedNumber) {
        this.bedNumber = bedNumber;
    }

    public LocalDateTime getAdmissionDate() {
        return admissionDate;
    }

    public void setAdmissionDate(LocalDateTime admissionDate) {
        this.admissionDate = admissionDate;
    }

    public LocalDateTime getDischargeDate() {
        return dischargeDate;
    }

    public void setDischargeDate(LocalDateTime dischargeDate) {
        this.dischargeDate = dischargeDate;
    }

    public AdmissionStatus getStatus() {
        return status;
    }

    public void setStatus(AdmissionStatus status) {
        this.status = status;
    }
}