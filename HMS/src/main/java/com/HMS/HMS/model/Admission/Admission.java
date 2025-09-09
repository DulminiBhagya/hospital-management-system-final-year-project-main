package com.HMS.HMS.model.Admission;

import com.HMS.HMS.model.Patient.Patient;
import com.HMS.HMS.model.ward.Ward;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
public class Admission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long admissionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_national_id",nullable = false)
    @JsonBackReference("patient-admissions")
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ward_id", nullable = false)
    @JsonBackReference("ward-admissions")
    private Ward ward;

    @Column(nullable = false)
    private String bedNumber;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime admissionDate;

    private LocalDateTime dischargeDate;

    @Enumerated(EnumType.STRING)
    private AdmissionStatus status = AdmissionStatus.ACTIVE;

    public Admission(){}

    public Admission(Patient patient, Ward ward, String bedNumber) {
        this.patient = patient;
        this.ward = ward;
        this.bedNumber = bedNumber;
    }

    public Admission(Long admissionId, Patient patient, Ward ward, String bedNumber, LocalDateTime admissionDate, LocalDateTime dischargeDate, AdmissionStatus status) {
        this.admissionId = admissionId;
        this.patient = patient;
        this.ward = ward;
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

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public Ward getWard() {
        return ward;
    }

    public void setWard(Ward ward) {
        this.ward = ward;
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