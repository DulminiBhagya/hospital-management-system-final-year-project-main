package com.HMS.HMS.model.Transfer;

import com.HMS.HMS.model.Admission.Admission;
import com.HMS.HMS.model.Patient.Patient;
import com.HMS.HMS.model.ward.Ward;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
public class Transfer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long transferId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_national_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_ward_id", nullable = false)
    private Ward fromWard;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_ward_id", nullable = false)
    private Ward toWard;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "old_admission_id", nullable = false)
    private Admission oldAdmission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "new_admission_id", nullable = false)
    private Admission newAdmission;

    @Column(nullable = false)
    private String fromBedNumber;

    @Column(nullable = false)
    private String toBedNumber;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime transferDate;

    @Column(nullable = false)
    private String transferReason;



    // Constructors
    public Transfer() {}

    public Transfer(Patient patient, Ward fromWard, Ward toWard,
                    Admission oldAdmission, Admission newAdmission,
                    String fromBedNumber, String toBedNumber,
                    String transferReason) {
        this.patient = patient;
        this.fromWard = fromWard;
        this.toWard = toWard;
        this.oldAdmission = oldAdmission;
        this.newAdmission = newAdmission;
        this.fromBedNumber = fromBedNumber;
        this.toBedNumber = toBedNumber;
        this.transferReason = transferReason;
    }

    // Getters and Setters
    public Long getTransferId() { return transferId; }
    public void setTransferId(Long transferId) { this.transferId = transferId; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public Ward getFromWard() { return fromWard; }
    public void setFromWard(Ward fromWard) { this.fromWard = fromWard; }

    public Ward getToWard() { return toWard; }
    public void setToWard(Ward toWard) { this.toWard = toWard; }

    public Admission getOldAdmission() { return oldAdmission; }
    public void setOldAdmission(Admission oldAdmission) { this.oldAdmission = oldAdmission; }

    public Admission getNewAdmission() { return newAdmission; }
    public void setNewAdmission(Admission newAdmission) { this.newAdmission = newAdmission; }

    public String getFromBedNumber() { return fromBedNumber; }
    public void setFromBedNumber(String fromBedNumber) { this.fromBedNumber = fromBedNumber; }

    public String getToBedNumber() { return toBedNumber; }
    public void setToBedNumber(String toBedNumber) { this.toBedNumber = toBedNumber; }

    public LocalDateTime getTransferDate() { return transferDate; }
    public void setTransferDate(LocalDateTime transferDate) { this.transferDate = transferDate; }

    public String getTransferReason() { return transferReason; }
    public void setTransferReason(String transferReason) { this.transferReason = transferReason; }
}